import { ClientSession, Model } from "mongoose";
import { productType_e, stockStatus_e } from "../utils/enum";
import { productInfo_t, stockStatus_t } from "../type";
import { ProductDocument } from "../models/product.interface";

export default class ProductRepo {
  constructor(private ProductModel: Model<ProductDocument>) {}

  startSession() {
    return this.ProductModel.db.startSession();
  }

  findById(id: string, session?: ClientSession) {
    const query = this.ProductModel.findOne({ id });
    return session ? query.session(session) : query;
  }

  findByName(name: string) {
    return this.ProductModel.findOne({ name });
  }

  create(data: productInfo_t, session?: ClientSession) {
    const product = new this.ProductModel(data);
    return product.save({ session });
  }

  updateById(id: string, data: Partial<productInfo_t>, session?: ClientSession) {
    return this.ProductModel.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true, session, runValidators: true },
    );
  }

  deleteById(id: string, session?: ClientSession) {
    return this.ProductModel.findOneAndDelete({ id }, { session });
  }

  initializeAnotherInventory() {
    return this.ProductModel.updateMany(
      {
        type: productType_e.another,
      },
      [
        {
          $set: {
            amount: { $ifNull: ["$amount", 0] },
            condition: { $ifNull: ["$condition", 0] },
          },
        },
        {
          $set: {
            status: {
              $cond: [
                { $eq: ["$amount", 0] },
                stockStatus_e.stockOut,
                {
                  $cond: [
                    { $lt: ["$amount", "$condition"] },
                    stockStatus_e.stockLow,
                    stockStatus_e.normal,
                  ],
                },
              ],
            },
          },
        },
      ],
    );
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
      anotherOut,
      anotherLow,
      anotherTotal,
    ] = await Promise.all([
      this.ProductModel.countDocuments({ type: productType_e.merchandise, status: stockStatus_e.stockOut }),
      this.ProductModel.countDocuments({ type: productType_e.merchandise, status: stockStatus_e.stockLow }),
      this.ProductModel.countDocuments({ type: productType_e.merchandise }),
      this.ProductModel.countDocuments({ type: productType_e.material, status: stockStatus_e.stockOut }),
      this.ProductModel.countDocuments({ type: productType_e.material, status: stockStatus_e.stockLow }),
      this.ProductModel.countDocuments({ type: productType_e.material }),
      this.ProductModel.countDocuments({ type: productType_e.another, status: stockStatus_e.stockOut }),
      this.ProductModel.countDocuments({ type: productType_e.another, status: stockStatus_e.stockLow }),
      this.ProductModel.countDocuments({ type: productType_e.another }),
    ]);

    return {
      stockTotal,
      stockLow,
      stockOut,
      materialTotal,
      materialLow,
      materialOut,
      anotherTotal,
      anotherLow,
      anotherOut,
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
