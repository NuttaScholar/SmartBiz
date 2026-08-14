import { Schema } from "mongoose";
import { LogAuditDocument } from "./log-audit.interface";

const TransactionSnapshotSchema = new Schema(
  {
    date: { type: Date, required: true },
    topic: { type: String, required: true },
    type: { type: Number, required: true },
    money: { type: Number, required: true },
    description: String,
    who: String,
    bill: String,
    readonly: { type: Boolean, required: true },
  },
  { _id: false },
);

export const LogAuditSchema = new Schema<LogAuditDocument>(
  {
    transactionId: { type: Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    actor: {
      type: {
        type: String,
        enum: ["user", "service"],
        required: true,
      },
      name: { type: String, required: true },
    },
    affectedCollections: {
      type: [String],
      default: ["transactions", "wallets"],
      immutable: true,
    },
    changedFields: { type: [String], default: [] },
    transactionBefore: { type: TransactionSnapshotSchema, default: null },
    transactionAfter: { type: TransactionSnapshotSchema, default: null },
    wallet: {
      name: { type: String, required: true },
      beforeAmount: { type: Number, required: true },
      afterAmount: { type: Number, required: true },
    },
    occurredAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: "log_audit",
    versionKey: false,
  },
);

LogAuditSchema.index(
  { transactionId: 1, occurredAt: -1 },
  { name: "transactionId_1_occurredAt_-1" },
);
LogAuditSchema.index(
  { action: 1, occurredAt: -1 },
  { name: "action_1_occurredAt_-1" },
);
LogAuditSchema.index(
  { "actor.name": 1, occurredAt: -1 },
  { name: "actor.name_1_occurredAt_-1" },
);
LogAuditSchema.index(
  { expiresAt: 1 },
  { name: "expiresAt_1_ttl", expireAfterSeconds: 0 },
);
