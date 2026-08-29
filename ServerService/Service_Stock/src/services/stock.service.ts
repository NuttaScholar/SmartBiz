import { ClientSession, isValidObjectId, Model } from "mongoose";
import axios from "axios";
import { BILL_BUCKET, DEFAULT_BUCKET, MINIO_HOST, SERVICE_BILL_URL } from "../config";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import {
  AuditAction,
  AuditActor,
  AuditOperation,
  LogAuditDocument,
  ProductSnapshot,
  StockLogSnapshot,
} from "../models/log-audit.interface";
import LogRepo from "../repositories/log.repo";
import LogAuditRepo from "../repositories/log-audit.repo";
import ProductRepo from "../repositories/product.repo";
import {
  logInfo_t,
  logRes_t,
  productInfo_t,
  productRes_t,
  stockAdjustmentForm_t,
  stockAdjustmentItem_t,
  stockAdjustmentResult_t,
  stockForm_t,
  stockLogUpdateForm_t,
  stockOutForm_t,
} from "../type";
import { errorCode_e, productType_e, stockLogType_e, stockStatus_e } from "../utils/enum";
import StorageService from "./storage.service";
import TransactionService from "./transaction.service";
import { createServiceToken } from "../utils/service-token";
import {
  getAuditDates,
  getChangedFields,
  toProductSnapshot,
} from "../utils/stock-audit";

type ProductUsageResponse = {
  success: boolean;
  data?: {
    productID: string;
    isUsed: boolean;
    orderCount: number;
  };
  errCode?: errorCode_e;
};

export default class StockService {
  private productRepo: ProductRepo;
  private logRepo: LogRepo;
  private logAuditRepo: LogAuditRepo;
  private transactionService: TransactionService;

  constructor(
    ProductModel: Model<ProductDocument>,
    LogModel: Model<LogDocument>,
    LogAuditModel: Model<LogAuditDocument>,
    private storageService: StorageService,
  ) {
    this.productRepo = new ProductRepo(ProductModel);
    this.logRepo = new LogRepo(LogModel);
    this.logAuditRepo = new LogAuditRepo(LogAuditModel);
    this.transactionService = new TransactionService(this.productRepo);
  }

  async createProduct(
    data: productInfo_t,
    actor: AuditActor,
    file?: Express.Multer.File,
  ) {
    await this.ensureProductIsUnique(data.id, data.name);

    const { img: _requestedImg, ...productData } = data;
    const amount = this.requireInventoryValue(data.amount, "amount");
    const condition = this.requireInventoryValue(data.condition, "condition");
    const status = this.resolveStockStatus(amount, condition);
    const img = file ? (await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url : undefined;

    const newProduct = {
      ...productData,
      amount,
      condition,
      status,
      ...(img ? { img } : {}),
    };
    const session = await this.productRepo.startSession();
    try {
      await session.withTransaction(async () => {
        const product = await this.productRepo.create(newProduct, session);
        await this.writeAudit(
          "CREATE",
          "PRODUCT_CREATE",
          product.id,
          actor,
          null,
          toProductSnapshot(product),
          null,
          ["products"],
          session,
        );
      }, this.transactionOptions());
    } catch (err) {
      if (img) await this.safeRemoveProductImage(img);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async updateProduct(
    data: productInfo_t,
    actor: AuditActor,
    file?: Express.Multer.File,
  ) {
    const product = await this.productRepo.findById(data.id);
    if (!product) {
      throw { code: errorCode_e.NotFoundError, message: "Product not found" };
    }

    if (product.name !== data.name && (await this.productRepo.findByName(data.name))) {
      throw { code: errorCode_e.AlreadyExistsError, message: "Product name already exists" };
    }

    const { img: _requestedImg, ...requestedProductData } = data;
    const amount = this.requireInventoryValue(
      product.amount ?? data.amount,
      "amount",
    );
    const condition = this.requireInventoryValue(data.condition, "condition");
    const productData = {
      ...requestedProductData,
      amount,
      condition,
    };
    const status = this.resolveStockStatus(amount, condition);
    const uploadedImg = file
      ? (await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url
      : undefined;
    const shouldRemoveImage = Boolean(uploadedImg) || data.img === "";
    const updateData = {
      ...productData,
      status,
      ...(uploadedImg !== undefined
        ? { img: uploadedImg }
        : data.img === ""
          ? { img: "" }
          : {}),
    };
    const session = await this.productRepo.startSession();
    try {
      await session.withTransaction(async () => {
        const current = await this.productRepo.findById(data.id, session);
        if (!current) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        const before = toProductSnapshot(current);
        const updated = await this.productRepo.updateById(data.id, updateData, session);
        if (!updated) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        await this.writeAudit(
          "UPDATE",
          "PRODUCT_UPDATE",
          data.id,
          actor,
          before,
          toProductSnapshot(updated),
          null,
          ["products"],
          session,
        );
      }, this.transactionOptions());
    } catch (err) {
      if (uploadedImg) await this.safeRemoveProductImage(uploadedImg);
      throw err;
    } finally {
      await session.endSession();
    }

    if (shouldRemoveImage && product.img && product.img !== uploadedImg) {
      await this.safeRemoveProductImage(product.img);
    }
  }

  async getProducts(type?: string, name?: string, status?: string): Promise<productRes_t> {
    const [products, stockStatus] = await Promise.all([
      this.productRepo.search(type, name, status),
      this.productRepo.getStockStatus(),
    ]);

    return { products: products.map((product) => this.withProductImageUrl(product)), status: stockStatus };
  }

  async deleteProduct(id: string | undefined, actor: AuditActor) {
    if (!id) {
      throw { code: errorCode_e.InvalidInputError, message: "id is required" };
    }

    await this.ensureProductIsNotUsedInOrders(id);

    const session = await this.productRepo.startSession();
    let imageToRemove: string | undefined;
    try {
      await session.withTransaction(async () => {
        const product = await this.productRepo.findById(id, session);
        if (!product) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        const before = toProductSnapshot(product);
        const deleted = await this.productRepo.deleteById(id, session);
        if (!deleted) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        await this.writeAudit(
          "DELETE",
          "PRODUCT_DELETE",
          id,
          actor,
          before,
          null,
          null,
          ["products"],
          session,
        );
        imageToRemove = product.img;
      }, this.transactionOptions());
    } finally {
      await session.endSession();
    }
    if (imageToRemove) await this.safeRemoveProductImage(imageToRemove);
  }

  async stockIn(
    productsText: string | undefined,
    who: string | undefined,
    requestedDate: string | undefined,
    actor: AuditActor,
    file?: Express.Multer.File,
  ) {
    if (!file || !productsText) {
      throw { code: errorCode_e.InvalidInputError, message: "products and bill image are required" };
    }

    const products = JSON.parse(productsText) as stockForm_t[];
    const date = this.normalizeTransactionDate(requestedDate);
    const imgKey = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
    const uploadedBill = await this.storageService.uploadImage(file.buffer, BILL_BUCKET, imgKey);

    const transactionRes = await this.transactionService.postStockIn(
      products,
      uploadedBill.url,
      date,
      who,
    );
    if (!transactionRes.success) {
      throw { code: transactionRes.errCode || errorCode_e.UnknownError, message: "Create transaction failed" };
    }

    const session = await this.productRepo.startSession();
    try {
      let errors: stockForm_t[] = [];
      await session.withTransaction(async () => {
        const result = await this.applyStockChange(
          products,
          stockLogType_e.in,
          date,
          actor,
          session,
          uploadedBill.url,
        );
        errors = result.errors;
        if (result.logs.length) await this.logRepo.insertMany(result.logs, session);
      }, this.transactionOptions());
      return errors;
    } finally {
      await session.endSession();
    }
  }

  async stockOut(data: stockOutForm_t, actor: AuditActor) {
    const date = this.normalizeTransactionDate(data?.date);
    const session = await this.productRepo.startSession();
    try {
      let errors: stockForm_t[] = [];
      await session.withTransaction(async () => {
        const result = await this.applyStockChange(
          data.products,
          stockLogType_e.out,
          date,
          actor,
          session,
          undefined,
          data.note,
        );
        errors = result.errors;
        if (result.logs.length) await this.logRepo.insertMany(result.logs, session);
      }, this.transactionOptions());
      return errors;
    } finally {
      await session.endSession();
    }
  }

  async adjustStock(
    data: stockAdjustmentForm_t,
    actor: AuditActor,
  ): Promise<stockAdjustmentResult_t> {
    const adjustments = this.normalizeAdjustments(data?.items);
    const reference = this.optionalTrimmedString(data?.reference, "reference");
    const note = this.optionalTrimmedString(data?.note, "note");
    const date = new Date();
    const session = await this.productRepo.startSession();

    try {
      let items: stockAdjustmentResult_t["items"] = [];
      await session.withTransaction(async () => {
        const nextItems: stockAdjustmentResult_t["items"] = [];

        for (const adjustment of adjustments) {
          const product = await this.productRepo.findById(
            adjustment.productID,
            session,
          );
          if (!product) {
            throw {
              code: errorCode_e.NotFoundError,
              message: `Product not found: ${adjustment.productID}`,
            };
          }

          const beforeAmount = Number(product.amount);
          if (!Number.isFinite(beforeAmount)) {
            throw {
              code: errorCode_e.InvalidStateError,
              message: `Product stock amount not found: ${adjustment.productID}`,
            };
          }

          const afterAmount = beforeAmount + adjustment.delta;
          if (afterAmount < 0) {
            throw {
              code: errorCode_e.InvalidStateError,
              message: `Insufficient stock for product ${adjustment.productID}. Available: ${beforeAmount}`,
            };
          }

          const before = toProductSnapshot(product);
          const type = adjustment.delta > 0
            ? stockLogType_e.in
            : stockLogType_e.out;
          const updated = await this.productRepo.updateById(
            adjustment.productID,
            {
              amount: afterAmount,
              status: this.resolveStockStatus(
                afterAmount,
                Number(product.condition ?? 0),
              ),
            },
            session,
          );
          if (!updated) {
            throw {
              code: errorCode_e.NotFoundError,
              message: `Product not found: ${adjustment.productID}`,
            };
          }

          const auditStockLog: StockLogSnapshot = {
            amount: Math.abs(adjustment.delta),
            type,
            date,
            note,
            reference,
          };
          await this.writeAudit(
            "UPDATE",
            type === stockLogType_e.in ? "STOCK_IN" : "STOCK_OUT",
            adjustment.productID,
            actor,
            before,
            toProductSnapshot(updated),
            auditStockLog,
            ["products"],
            session,
          );
          nextItems.push({
            productID: adjustment.productID,
            beforeAmount,
            afterAmount,
          });
        }

        items = nextItems;
      }, this.transactionOptions());

      return { reference, items };
    } finally {
      await session.endSession();
    }
  }

  async getLog(id?: string, type?: string, index?: string, size?: string): Promise<logRes_t> {
    if (!id) {
      throw { code: errorCode_e.InvalidInputError, message: "id is required" };
    }

    const typeNumber = Number(type || "0");
    const indexNumber = Number(index || "0");
    const sizeNumber = Number(size || "50");
    const [total, logs] = await Promise.all([
      this.logRepo.countByProduct(id, typeNumber),
      this.logRepo.findByProduct(id, typeNumber, indexNumber, sizeNumber),
    ]);

    return {
      total,
      index: indexNumber,
      size: logs.length,
      logs,
    };
  }

  async updateLog(
    id: string | undefined,
    data: stockLogUpdateForm_t,
    actor: AuditActor,
  ) {
    if (!id || !isValidObjectId(id)) {
      throw { code: errorCode_e.InvalidInputError, message: "Valid log id is required" };
    }
    const amount = Number(data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw { code: errorCode_e.InvalidInputError, message: "amount must be greater than zero" };
    }

    const session = await this.productRepo.startSession();
    try {
      let result: logInfo_t | undefined;
      await session.withTransaction(async () => {
        const log = await this.logRepo.findById(id, session);
        if (!log) {
          throw { code: errorCode_e.NotFoundError, message: "Stock log not found" };
        }
        if (log.type !== stockLogType_e.in && log.type !== stockLogType_e.out) {
          throw { code: errorCode_e.InvalidStateError, message: "Invalid stock log type" };
        }

        const product = await this.productRepo.findById(log.productID, session);
        if (!product) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        const currentAmount = Number(product.amount);
        const previousLogAmount = Number(log.amount);
        if (!Number.isFinite(currentAmount) || !Number.isFinite(previousLogAmount)) {
          throw { code: errorCode_e.InvalidStateError, message: "Invalid stock amount" };
        }

        const nextProductAmount = log.type === stockLogType_e.in
          ? currentAmount + amount - previousLogAmount
          : currentAmount + previousLogAmount - amount;
        if (nextProductAmount < 0) {
          throw {
            code: errorCode_e.InvalidStateError,
            message: "The edited amount would make stock negative",
          };
        }

        const logUpdate: Partial<logInfo_t> = { amount };
        if (data.date !== undefined) {
          logUpdate.date = this.normalizeTransactionDate(data.date);
        }
        const unsetFields: Array<"price" | "note"> = [];
        if (log.type === stockLogType_e.in && data.price !== undefined) {
          if (data.price === null) {
            unsetFields.push("price");
          } else {
            const price = Number(data.price);
            if (!Number.isFinite(price) || price < 0) {
              throw { code: errorCode_e.InvalidInputError, message: "price must be non-negative" };
            }
            logUpdate.price = price;
          }
        }
        if (log.type === stockLogType_e.out && data.note !== undefined) {
          const note = typeof data.note === "string" ? data.note.trim() : "";
          if (note) logUpdate.note = note;
          else unsetFields.push("note");
        }

        const before = toProductSnapshot(product);
        const updatedProduct = await this.productRepo.updateById(
          product.id,
          {
            amount: nextProductAmount,
            status: this.resolveStockStatus(
              nextProductAmount,
              Number(product.condition ?? 0),
            ),
          },
          session,
        );
        const updatedLog = await this.logRepo.updateById(
          id,
          logUpdate,
          unsetFields,
          session,
        );
        if (!updatedProduct || !updatedLog) {
          throw { code: errorCode_e.NotFoundError, message: "Stock log not found" };
        }

        const stockLog: StockLogSnapshot = {
          amount: updatedLog.amount,
          type: updatedLog.type,
          date: updatedLog.date,
          price: updatedLog.price,
          bill: updatedLog.bill,
          note: updatedLog.note,
        };
        const stockLogChangedFields = (["amount", "price", "note"] as const)
          .filter((field) => log[field] !== updatedLog[field])
          .map((field) => `stockLog.${field}`);
        if (new Date(log.date).getTime() !== new Date(updatedLog.date).getTime()) {
          stockLogChangedFields.push("stockLog.date");
        }
        await this.writeAudit(
          "UPDATE",
          updatedLog.type === stockLogType_e.in ? "STOCK_IN" : "STOCK_OUT",
          updatedLog.productID,
          actor,
          before,
          toProductSnapshot(updatedProduct),
          stockLog,
          ["products", "logs"],
          session,
          stockLogChangedFields,
        );
        result = {
          id: updatedLog.id,
          productID: updatedLog.productID,
          amount: updatedLog.amount,
          type: updatedLog.type,
          date: updatedLog.date,
          price: updatedLog.price,
          bill: updatedLog.bill,
          note: updatedLog.note,
        };
      }, this.transactionOptions());
      return result;
    } finally {
      await session.endSession();
    }
  }

  async deleteLog(id: string | undefined, actor: AuditActor) {
    if (!id || !isValidObjectId(id)) {
      throw { code: errorCode_e.InvalidInputError, message: "Valid log id is required" };
    }

    const session = await this.productRepo.startSession();
    try {
      await session.withTransaction(async () => {
        const log = await this.logRepo.findById(id, session);
        if (!log) {
          throw { code: errorCode_e.NotFoundError, message: "Stock log not found" };
        }
        if (log.type !== stockLogType_e.in && log.type !== stockLogType_e.out) {
          throw { code: errorCode_e.InvalidStateError, message: "Invalid stock log type" };
        }

        const product = await this.productRepo.findById(log.productID, session);
        if (!product) {
          throw { code: errorCode_e.NotFoundError, message: "Product not found" };
        }
        const currentAmount = Number(product.amount);
        const logAmount = Number(log.amount);
        if (!Number.isFinite(currentAmount) || !Number.isFinite(logAmount)) {
          throw { code: errorCode_e.InvalidStateError, message: "Invalid stock amount" };
        }

        const nextProductAmount = log.type === stockLogType_e.in
          ? currentAmount - logAmount
          : currentAmount + logAmount;
        if (nextProductAmount < 0) {
          throw {
            code: errorCode_e.InvalidStateError,
            message: "Deleting this log would make stock negative",
          };
        }

        const before = toProductSnapshot(product);
        const updatedProduct = await this.productRepo.updateById(
          product.id,
          {
            amount: nextProductAmount,
            status: this.resolveStockStatus(
              nextProductAmount,
              Number(product.condition ?? 0),
            ),
          },
          session,
        );
        const deletedLog = await this.logRepo.deleteById(id, session);
        if (!updatedProduct || !deletedLog) {
          throw { code: errorCode_e.NotFoundError, message: "Stock log not found" };
        }

        const stockLog: StockLogSnapshot = {
          amount: deletedLog.amount,
          type: deletedLog.type,
          date: deletedLog.date,
          price: deletedLog.price,
          bill: deletedLog.bill,
          note: deletedLog.note,
        };
        await this.writeAudit(
          "DELETE",
          deletedLog.type === stockLogType_e.in ? "STOCK_IN" : "STOCK_OUT",
          deletedLog.productID,
          actor,
          before,
          toProductSnapshot(updatedProduct),
          stockLog,
          ["products", "logs"],
          session,
          ["stockLog"],
        );
      }, this.transactionOptions());
    } finally {
      await session.endSession();
    }
  }

  getStatus() {
    return this.productRepo.getStockStatus();
  }

  async getStock(productType?: string | string[]) {
    const products = await this.productRepo.listStockProducts(this.parseProductTypes(productType));
    return products.map((product) => this.withProductImageUrl(product));
  }

  private withProductImageUrl(product: productInfo_t): productInfo_t {
    if (!product.img) return product;

    return {
      ...product,
      img: `${MINIO_HOST.replace(/\/$/, "")}/${this.getStoragePath(product.img)}`,
    };
  }

  private getStoragePath(img: string) {
    if (/^https?:\/\//i.test(img)) {
      return new URL(img).pathname.replace(/^\/+/, "");
    }

    return img.replace(/^\/+/, "");
  }

  private async ensureProductIsUnique(id: string, name: string) {
    if (await this.productRepo.findById(id)) {
      throw { code: errorCode_e.AlreadyExistsError, message: "Product id already exists" };
    }

    if (await this.productRepo.findByName(name)) {
      throw { code: errorCode_e.AlreadyExistsError, message: "Product name already exists" };
    }
  }

  private async applyStockChange(
    products: stockForm_t[],
    type: stockLogType_e,
    date: Date,
    actor: AuditActor,
    session: ClientSession,
    bill?: string,
    note?: string,
  ) {
    const logs: logInfo_t[] = [];
    const errors: stockForm_t[] = [];

    for (const item of products) {
      const product = await this.productRepo.findById(item.productID, session);
      const itemAmount = Number(item.amount);
      if (!product || !Number.isFinite(itemAmount) || itemAmount <= 0) {
        errors.push(item);
        continue;
      }

      const currentAmount = Number(product.amount ?? 0);
      if (!Number.isFinite(currentAmount)) {
        errors.push(item);
        continue;
      }
      if (type === stockLogType_e.out && currentAmount < itemAmount) {
        errors.push(item);
        continue;
      }

      const before = toProductSnapshot(product);
      const newAmount = type === stockLogType_e.in
        ? currentAmount + itemAmount
        : currentAmount - itemAmount;
      const newStatus = this.resolveStockStatus(newAmount, Number(product.condition ?? 0));
      const updated = await this.productRepo.updateById(
        item.productID,
        { amount: newAmount, status: newStatus },
        session,
      );
      if (!updated) {
        throw { code: errorCode_e.NotFoundError, message: "Product not found" };
      }

      const log: logInfo_t = {
        productID: item.productID,
        amount: itemAmount,
        type,
        date,
        price: item.price,
        bill,
        note,
      };
      logs.push(log);
      await this.writeAudit(
        "UPDATE",
        type === stockLogType_e.in ? "STOCK_IN" : "STOCK_OUT",
        item.productID,
        actor,
        before,
        toProductSnapshot(updated),
        log,
        ["products", "logs"],
        session,
      );
    }

    return { logs, errors };
  }

  private resolveStockStatus(amount: number, condition: number) {
    if (amount === 0) return stockStatus_e.stockOut;
    if (amount < condition) return stockStatus_e.stockLow;
    return stockStatus_e.normal;
  }

  private normalizeAdjustments(items?: stockAdjustmentItem_t[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items must be a non-empty array",
      };
    }
    if (items.length > 500) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items must not contain more than 500 entries",
      };
    }

    const deltaByProduct = new Map<string, number>();
    for (const item of items) {
      const productID = typeof item?.productID === "string"
        ? item.productID.trim()
        : "";
      const delta = Number(item?.delta);
      if (!productID || !Number.isFinite(delta) || delta === 0) {
        throw {
          code: errorCode_e.InvalidInputError,
          message: "Each item requires productID and a non-zero numeric delta",
        };
      }
      deltaByProduct.set(
        productID,
        (deltaByProduct.get(productID) || 0) + delta,
      );
    }

    const normalized = [...deltaByProduct.entries()]
      .filter(([, delta]) => delta !== 0)
      .map(([productID, delta]) => ({ productID, delta }));
    if (normalized.length === 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Combined item delta must not be zero",
      };
    }
    return normalized;
  }

  private optionalTrimmedString(value: unknown, field: string) {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `${field} must be a string`,
      };
    }
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  private normalizeTransactionDate(value: unknown) {
    if (value === undefined || value === null || value === "") return new Date();
    if (typeof value !== "string" && !(value instanceof Date)) {
      throw { code: errorCode_e.InvalidInputError, message: "date must be a valid date" };
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw { code: errorCode_e.InvalidInputError, message: "date must be a valid date" };
    }
    return date;
  }

  private requireInventoryValue(value: unknown, fieldName: string) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `${fieldName} must be a non-negative number`,
      };
    }
    return numberValue;
  }

  private parseProductTypes(productType?: string | string[]) {
    const defaultTypes = [
      productType_e.merchandise,
      productType_e.material,
      productType_e.another,
    ];
    if (productType === undefined) return defaultTypes;

    const rawTypes = Array.isArray(productType)
      ? productType.flatMap((type) => type.split(","))
      : productType.split(",");

    const parsedTypes = rawTypes
      .map((type) => type.trim())
      .filter(Boolean)
      .map(Number);

    const allowedTypes = Object.values(productType_e).filter((value): value is productType_e => typeof value === "number");
    if (
      parsedTypes.length === 0 ||
      parsedTypes.some((type) => !Number.isInteger(type) || !allowedTypes.includes(type))
    ) {
      throw { code: errorCode_e.InvalidInputError, message: "Invalid productType" };
    }

    return [...new Set(parsedTypes)] as productType_e[];
  }

  private async ensureProductIsNotUsedInOrders(productID: string) {
    try {
      const serviceToken = createServiceToken(
        "service_bill",
        ["bill.product-usage.read"],
      );
      const response = await axios.get<ProductUsageResponse>(
        `${SERVICE_BILL_URL.replace(/\/$/, "")}/bill/product/${encodeURIComponent(productID)}/usage`,
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
          },
        },
      );

      if (!response.data?.success) {
        throw {
          code: response.data?.errCode || errorCode_e.UnknownError,
          message: "Check product usage failed",
        };
      }

      if (response.data.data?.isUsed) {
        throw {
          code: errorCode_e.InUseError,
          message: `Product is used in ${response.data.data.orderCount} order(s)`,
        };
      }
    } catch (err: any) {
      if (err.code) throw err;

      const billError = err.response?.data;
      throw {
        code: billError?.errCode || errorCode_e.UnknownError,
        message: "Check product usage failed",
      };
    }
  }

  private async writeAudit(
    action: AuditAction,
    operation: AuditOperation,
    productID: string,
    actor: AuditActor,
    before: ProductSnapshot | null,
    after: ProductSnapshot | null,
    stockLog: StockLogSnapshot | null,
    affectedCollections: string[],
    session: ClientSession,
    additionalChangedFields: string[] = [],
  ) {
    const { occurredAt, expiresAt } = getAuditDates();
    await this.logAuditRepo.create({
      productID,
      action,
      operation,
      actor,
      affectedCollections,
      changedFields: [
        ...new Set([
          ...getChangedFields(before, after),
          ...additionalChangedFields,
        ]),
      ],
      productBefore: before,
      productAfter: after,
      stockLog,
      occurredAt,
      expiresAt,
    }, session);
  }

  private transactionOptions() {
    return {
      readConcern: { level: "snapshot" as const },
      writeConcern: { w: "majority" as const },
    };
  }

  private async safeRemoveProductImage(img: string) {
    try {
      await this.removeProductImage(img);
    } catch (err) {
      console.error("Remove product image failed", err);
    }
  }

  private async removeProductImage(img?: string) {
    if (!img) return;

    const key = img.split("/").pop();
    if (key) {
      await this.storageService.removeObject(DEFAULT_BUCKET, key);
    }
  }
}
