import { Model } from "mongoose";
import { statement_t, TransitionForm_t } from "../type";
import { TransactionDocument } from "../models/transaction.interface";

export default class TransactionRepo {
  constructor(private TransactionModel: Model<TransactionDocument>) {}

  create(data: TransitionForm_t) {
    return new this.TransactionModel(data).save();
  }

  findById(id?: string | string[]) {
    return this.TransactionModel.findOne({ _id: id });
  }

  findByContact(codeName?: string | string[]) {
    return this.TransactionModel.find({ who: codeName });
  }

  async search(filter: Record<string, unknown>): Promise<statement_t[]> {
    const data = await this.TransactionModel.aggregate([
      { $match: filter },
      {
        $addFields: {
          newDate: {
            $add: ["$date", { $multiply: [7, 60, 60, 1000] }],
          },
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
            month: { $dateToString: { format: "%Y-%m", date: "$newDate" } },
          },
          transactions: {
            $push: {
              id: "$_id",
              topic: "$topic",
              type: "$type",
              money: "$money",
              who: "$who",
              description: "$description",
              readonly: "$readonly",
              bill: "$bill",
            },
          },
        },
      },
      { $sort: { "_id.date": -1 } },
      {
        $group: {
          _id: "$_id.month",
          detail: {
            $push: {
              date: "$_id.date",
              transactions: "$transactions",
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return data.map((monthGroup) => ({
      date: new Date(`${monthGroup._id}-01`),
      detail: monthGroup.detail.map((daily: { date: Date; transactions: unknown[] }) => ({
        date: new Date(daily.date),
        transactions: daily.transactions,
      })),
    }));
  }

  updateById(id: string | string[] | undefined, data: Partial<TransitionForm_t>) {
    return this.TransactionModel.updateOne({ _id: id }, data);
  }

  deleteById(id: string | string[] | undefined) {
    return this.TransactionModel.deleteOne({ _id: id });
  }
}
