import { ClientSession, Model } from "mongoose";
import { LogDocument } from "../models/log.interface";
import { logInfo_t } from "../type";

export default class LogRepo {
  constructor(private LogModel: Model<LogDocument>) {}

  insertMany(logs: logInfo_t[], session?: ClientSession) {
    return this.LogModel.insertMany(logs, { session });
  }

  countByProduct(productID: string, type: number) {
    return this.LogModel.countDocuments({ productID, type });
  }

  findByProduct(productID: string, type: number, index: number, size: number) {
    return this.LogModel.aggregate<logInfo_t>([
      { $match: { productID, type } },
      { $sort: { date: -1 } },
      { $skip: index },
      { $limit: size },
      {
        $project: {
          _id: 0,
          productID: "$productID",
          amount: "$amount",
          type: "$type",
          date: "$date",
          price: "$price",
          bill: "$bill",
          note: "$note",
        },
      },
    ]);
  }
}
