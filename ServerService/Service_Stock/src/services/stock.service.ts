import { Model } from "mongoose";
import { BILL_BUCKET, DEFAULT_BUCKET, MINIO_HOST } from "../config";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import LogRepo from "../repositories/log.repo";
import ProductRepo from "../repositories/product.repo";
import { logInfo_t, logRes_t, productInfo_t, productRes_t, stockForm_t, stockOutForm_t } from "../type";
import { errorCode_e, stockLogType_e, stockStatus_e } from "../utils/enum";
import StorageService from "./storage.service";
import TransactionService from "./transaction.service";

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

    const status = this.resolveStockStatus(Number(data.amount), Number(data.condition));
    const img = file ? `${MINIO_HOST}/${(await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url}` : undefined;

    await this.productRepo.create({ ...data, status, ...(img ? { img } : {}) });
  }

  async updateProduct(data: productInfo_t, file?: Express.Multer.File) {
    const product = await this.productRepo.findById(data.id);
    if (!product) {
      throw { code: errorCode_e.NotFoundError, message: "Product not found" };
    }

    if (product.name !== data.name && (await this.productRepo.findByName(data.name))) {
      throw { code: errorCode_e.AlreadyExistsError, message: "Product name already exists" };
    }

    const status = this.resolveStockStatus(Number(product.amount), Number(data.condition));
    if (file) {
      await this.removeProductImage(product.img);
      const img = `${MINIO_HOST}/${(await this.storageService.uploadImage(file.buffer, DEFAULT_BUCKET, data.id)).url}`;
      await this.productRepo.updateById(data.id, { ...data, status, img });
      return;
    }

    if (data.img === "") {
      await this.removeProductImage(product.img);
      await this.productRepo.updateById(data.id, { ...data, status, img: "" });
      return;
    }

    await this.productRepo.updateById(data.id, { ...data, status });
  }

  async getProducts(type?: string, name?: string, status?: string): Promise<productRes_t> {
    const [products, stockStatus] = await Promise.all([
      this.productRepo.search(type, name, status),
      this.productRepo.getStockStatus(),
    ]);

    return { products, status: stockStatus };
  }

  async deleteProduct(id?: string) {
    if (!id) {
      throw { code: errorCode_e.InvalidInputError, message: "id is required" };
    }

    const product = await this.productRepo.findById(id);
    if (product?.img) {
      await this.removeProductImage(product.img);
    }

    await this.productRepo.deleteById(id);
  }

  async stockIn(token: string, productsText?: string, who?: string, file?: Express.Multer.File) {
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

    const transactionRes = await this.transactionService.postStockIn(token, products, uploadedBill.url, who);
    if (transactionRes.status === "error") {
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

  getStock() {
    return this.productRepo.listStockProducts();
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
        if (!product || product.amount === undefined) {
          errors.push(item);
          continue;
        }

        const currentAmount = Number(product.amount);
        if (type === stockLogType_e.out && currentAmount < item.amount) {
          errors.push(item);
          continue;
        }

        const newAmount = type === stockLogType_e.in ? currentAmount + item.amount : currentAmount - item.amount;
        const newStatus = this.resolveStockStatus(newAmount, Number(product.condition));
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

  private async removeProductImage(img?: string) {
    if (!img) return;

    const key = img.split("/").pop();
    if (key) {
      await this.storageService.removeObject(DEFAULT_BUCKET, key);
    }
  }
}
