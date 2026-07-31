import { Model } from "mongoose";
import axios from "axios";
import { BILL_BUCKET, DEFAULT_BUCKET, MINIO_HOST, SERVICE_BILL_URL } from "../config";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import LogRepo from "../repositories/log.repo";
import ProductRepo from "../repositories/product.repo";
import { logInfo_t, logRes_t, productInfo_t, productRes_t, stockForm_t, stockOutForm_t } from "../type";
import { errorCode_e, productType_e, stockLogType_e, stockStatus_e } from "../utils/enum";
import StorageService from "./storage.service";
import TransactionService from "./transaction.service";
import { createServiceToken } from "../utils/service-token";

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
  private transactionService: TransactionService;

  constructor(
    ProductModel: Model<ProductDocument>,
    LogModel: Model<LogDocument>,
    private storageService: StorageService,
  ) {
    this.productRepo = new ProductRepo(ProductModel);
    this.logRepo = new LogRepo(LogModel);
    this.transactionService = new TransactionService(this.productRepo);
  }

  async createProduct(data: productInfo_t, file?: Express.Multer.File) {
    await this.ensureProductIsUnique(data.id, data.name);

    const { img: _requestedImg, ...productData } = data;
    const amount = this.requireInventoryValue(data.amount, "amount");
    const condition = this.requireInventoryValue(data.condition, "condition");
    const status = this.resolveStockStatus(amount, condition);
    const img = file ? (await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url : undefined;

    await this.productRepo.create({
      ...productData,
      amount,
      condition,
      status,
      ...(img ? { img } : {}),
    });
  }

  async updateProduct(data: productInfo_t, file?: Express.Multer.File) {
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
    if (file) {
      await this.removeProductImage(product.img);
      const img = (await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url;
      await this.productRepo.updateById(data.id, { ...productData, status, img });
      return;
    }

    if (data.img === "") {
      await this.removeProductImage(product.img);
      await this.productRepo.updateById(data.id, { ...productData, status, img: "" });
      return;
    }

    await this.productRepo.updateById(data.id, { ...productData, status });
  }

  async getProducts(type?: string, name?: string, status?: string): Promise<productRes_t> {
    const [products, stockStatus] = await Promise.all([
      this.productRepo.search(type, name, status),
      this.productRepo.getStockStatus(),
    ]);

    return { products: products.map((product) => this.withProductImageUrl(product)), status: stockStatus };
  }

  async deleteProduct(id?: string) {
    if (!id) {
      throw { code: errorCode_e.InvalidInputError, message: "id is required" };
    }

    await this.ensureProductIsNotUsedInOrders(id);

    const product = await this.productRepo.findById(id);
    if (product?.img) {
      await this.removeProductImage(product.img);
    }

    await this.productRepo.deleteById(id);
  }

  async stockIn(productsText?: string, who?: string, file?: Express.Multer.File) {
    if (!file || !productsText) {
      throw { code: errorCode_e.InvalidInputError, message: "products and bill image are required" };
    }

    const products = JSON.parse(productsText) as stockForm_t[];
    const date = new Date();
    const imgKey = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
    const uploadedBill = await this.storageService.uploadImage(file.buffer, BILL_BUCKET, imgKey);

    const transactionRes = await this.transactionService.postStockIn(products, uploadedBill.url, who);
    if (!transactionRes.success) {
      throw { code: transactionRes.errCode || errorCode_e.UnknownError, message: "Create transaction failed" };
    }

    const { logs, errors } = await this.applyStockChange(products, stockLogType_e.in, date, uploadedBill.url);
    await this.logRepo.insertMany(logs);
    return errors;
  }

  async stockOut(data: stockOutForm_t) {
    const date = new Date();
    const { logs, errors } = await this.applyStockChange(data.products, stockLogType_e.out, date, undefined, data.note);
    await this.logRepo.insertMany(logs);
    return errors;
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
    bill?: string,
    note?: string,
  ) {
    const logs: logInfo_t[] = [];
    const errors: stockForm_t[] = [];

    for (const item of products) {
      try {
        const product = await this.productRepo.findById(item.productID);
        if (!product) {
          errors.push(item);
          continue;
        }

        const currentAmount = Number(product.amount ?? 0);
        if (!Number.isFinite(currentAmount)) {
          errors.push(item);
          continue;
        }
        if (type === stockLogType_e.out && currentAmount < item.amount) {
          errors.push(item);
          continue;
        }

        const newAmount = type === stockLogType_e.in ? currentAmount + item.amount : currentAmount - item.amount;
        const newStatus = this.resolveStockStatus(
          newAmount,
          Number(product.condition ?? 0),
        );
        await this.productRepo.updateById(item.productID, { amount: newAmount, status: newStatus });

        logs.push({
          productID: item.productID,
          amount: item.amount,
          type,
          date,
          price: item.price,
          bill,
          note,
        });
      } catch (err) {
        errors.push(item);
      }
    }

    return { logs, errors };
  }

  private resolveStockStatus(amount: number, condition: number) {
    if (amount === 0) return stockStatus_e.stockOut;
    if (amount < condition) return stockStatus_e.stockLow;
    return stockStatus_e.normal;
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

  private async removeProductImage(img?: string) {
    if (!img) return;

    const key = img.split("/").pop();
    if (key) {
      await this.storageService.removeObject(DEFAULT_BUCKET, key);
    }
  }
}
