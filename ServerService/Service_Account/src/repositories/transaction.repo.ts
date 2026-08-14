import { ClientSession, Model } from "mongoose";
import { statement_t, TransitionForm_t } from "../type";
import { TransactionDocument } from "../models/transaction.interface";

const LOCAL_TIMEZONE = "Asia/Bangkok";

export default class TransactionRepo {
  constructor(private TransactionModel: Model<TransactionDocument>) {}

  startSession() {
    return this.TransactionModel.db.startSession();
  }

  create(data: TransitionForm_t, session?: ClientSession) {
    return new this.TransactionModel(data).save({ session });
  }

  findById(id?: string | string[], session?: ClientSession) {
    const query = this.TransactionModel.findOne({ _id: id });
    return session ? query.session(session) : query;
  }

  findByContact(codeName?: string | string[]) {
    return this.TransactionModel.find({ who: codeName });
  }

  async search(filter: Record<string, unknown>): Promise<statement_t[]> {
    const data = await this.TransactionModel.aggregate([
      { $match: filter },
      {
        $addFields: {
          localDate: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: LOCAL_TIMEZONE } },
          localMonth: { $dateToString: { format: "%Y-%m", date: "$date", timezone: LOCAL_TIMEZONE } },
        },
      },
      {
        $group: {
          _id: {
            date: "$localDate",
            month: "$localMonth",
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
      date: new Date(`${monthGroup._id}-01T00:00:00+07:00`),
      detail: monthGroup.detail.map((daily: { date: string; transactions: unknown[] }) => ({
        date: new Date(`${daily.date}T00:00:00+07:00`),
        transactions: daily.transactions,
      })),
    }));
  }

  updateById(
    id: string | string[] | undefined,
    data: Partial<TransitionForm_t>,
    session?: ClientSession,
  ) {
    return this.TransactionModel.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true, session, runValidators: true },
    );
  }

  deleteById(id: string | string[] | undefined, session?: ClientSession) {
    return this.TransactionModel.deleteOne({ _id: id }, { session });
  }
}
