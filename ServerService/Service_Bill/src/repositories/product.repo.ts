import { Model } from "mongoose";
import { ProductDocument } from "../models/product.interface";

export default class ProductRepo {
  constructor(private ProductModel: Model<ProductDocument>) {}

  findById(id: string) {
    return this.ProductModel.findOne({ id });
  }

  findByIds(ids: string[]) {
    return this.ProductModel.find({ id: { $in: ids } });
  }
}
