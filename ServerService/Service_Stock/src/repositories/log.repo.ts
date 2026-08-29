import { ClientSession, Model } from "mongoose";
import { LogDocument } from "../models/log.interface";
import { logInfo_t } from "../type";

export default class LogRepo {
  constructor(private LogModel: Model<LogDocument>) {}

  insertMany(logs: logInfo_t[], session?: ClientSession) {
    return this.LogModel.insertMany(logs, { session });
  }

  findById(id: string, session?: ClientSession) {
    const query = this.LogModel.findById(id);
    return session ? query.session(session) : query;
  }

  updateById(
    id: string,
    data: Partial<logInfo_t>,
    unsetFields: Array<"price" | "note">,
    session?: ClientSession,
  ) {
    const update: Record<string, unknown> = { $set: data };
    if (unsetFields.length) {
      update.$unset = Object.fromEntries(unsetFields.map((field) => [field, 1]));
    }
    return this.LogModel.findByIdAndUpdate(id, update, {
      new: true,
      session,
      runValidators: true,
    });
  }

  deleteById(id: string, session?: ClientSession) {
    return this.LogModel.findByIdAndDelete(id, { session });
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
          id: { $toString: "$_id" },
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
