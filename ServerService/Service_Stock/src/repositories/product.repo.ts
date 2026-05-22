import { Model } from "mongoose";
import { productType_e, stockStatus_e } from "../utils/enum";
import { productInfo_t, stockStatus_t } from "../type";
import { ProductDocument } from "../models/product.interface";

export default class ProductRepo {
  constructor(private ProductModel: Model<ProductDocument>) {}

  findById(id: string) {
    return this.ProductModel.findOne({ id });
  }

  findByName(name: string) {
    return this.ProductModel.findOne({ name });
  }

  create(data: productInfo_t) {
    const product = new this.ProductModel(data);
    return product.save();
  }

  updateById(id: string, data: Partial<productInfo_t>) {
    return this.ProductModel.updateOne({ id }, data);
  }

  deleteById(id: string) {
    return this.ProductModel.deleteOne({ id });
  }

  async search(type?: string, name?: string, status?: string) {
    const filter: Record<string, number> = {};
    if (status) filter.status = Number(status);
    if (type) filter.type = Number(type);

    const matchStage = name ? { $match: { name: { $regex: name, $options: "i" } } } : null;

    return this.ProductModel.aggregate<productInfo_t>([
      { $match: filter },
      ...(matchStage ? [matchStage] : []),
      this.projectProduct(),
      { $sort: { name: 1 } },
    ]);
  }

  listStockProducts(productTypes: productType_e[]) {
    return this.ProductModel.aggregate<productInfo_t>([
      { $match: { type: { $in: productTypes } } },
      this.projectProduct(),
      { $sort: { name: 1 } },
    ]);
  }

  async getStockStatus(): Promise<stockStatus_t> {
    const [
      stockOut,
      stockLow,
      stockTotal,
      materialOut,
      materialLow,
      materialTotal,
    ] = await Promise.all([
      this.ProductModel.countDocuments({ type: productType_e.merchandise, status: stockStatus_e.stockOut }),
      this.ProductModel.countDocuments({ type: productType_e.merchandise, status: stockStatus_e.stockLow }),
      this.ProductModel.countDocuments({ type: productType_e.merchandise }),
      this.ProductModel.countDocuments({ type: productType_e.material, status: stockStatus_e.stockOut }),
      this.ProductModel.countDocuments({ type: productType_e.material, status: stockStatus_e.stockLow }),
      this.ProductModel.countDocuments({ type: productType_e.material }),
    ]);

    return {
      stockTotal,
      stockLow,
      stockOut,
      materialTotal,
      materialLow,
      materialOut,
    };
  }

  private projectProduct() {
    return {
      $project: {
        _id: 0,
        id: "$id",
        type: "$type",
        name: "$name",
        img: "$img",
        condition: "$condition",
        status: "$status",
        price: "$price",
        description: "$description",
        amount: "$amount",
      },
    };
  }
}
