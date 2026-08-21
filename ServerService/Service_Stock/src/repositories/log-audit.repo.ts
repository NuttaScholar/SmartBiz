import { ClientSession, FilterQuery, Model } from "mongoose";
import { LogAuditDocument } from "../models/log-audit.interface";

export default class LogAuditRepo {
  constructor(private LogAuditModel: Model<LogAuditDocument>) {}

  create(data: Partial<LogAuditDocument>, session: ClientSession) {
    return new this.LogAuditModel(data).save({ session });
  }

  insertMany(data: Partial<LogAuditDocument>[], session: ClientSession) {
    return this.LogAuditModel.insertMany(data, { session });
  }

  findById(id: string) {
    return this.LogAuditModel.findById(id).lean();
  }

  async query(
    filter: FilterQuery<LogAuditDocument>,
    page: number,
    size: number,
  ) {
    const [logs, total] = await Promise.all([
      this.LogAuditModel.find(filter)
        .sort({ occurredAt: -1, _id: -1 })
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      this.LogAuditModel.countDocuments(filter),
    ]);

    return { logs, total };
  }
}
