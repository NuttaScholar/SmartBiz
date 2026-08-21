import { Schema } from "mongoose";
import { LogAuditDocument } from "./log-audit.interface";

const ProductSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: Number, required: true },
    name: { type: String, required: true },
    condition: { type: Number, required: true },
    img: String,
    status: Number,
    price: Number,
    description: String,
    amount: Number,
  },
  { _id: false },
);

const StockLogSnapshotSchema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: Number, required: true },
    date: { type: Date, required: true },
    price: Number,
    bill: String,
    note: String,
    reference: String,
  },
  { _id: false },
);

export const LogAuditSchema = new Schema<LogAuditDocument>(
  {
    productID: { type: String, required: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    operation: {
      type: String,
      enum: [
        "PRODUCT_CREATE",
        "PRODUCT_UPDATE",
        "PRODUCT_DELETE",
        "STOCK_IN",
        "STOCK_OUT",
      ],
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
    affectedCollections: { type: [String], required: true },
    changedFields: { type: [String], default: [] },
    productBefore: { type: ProductSnapshotSchema, default: null },
    productAfter: { type: ProductSnapshotSchema, default: null },
    stockLog: { type: StockLogSnapshotSchema, default: null },
    occurredAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: "log_audit", versionKey: false },
);

LogAuditSchema.index(
  { productID: 1, occurredAt: -1 },
  { name: "productID_1_occurredAt_-1" },
);
LogAuditSchema.index(
  { operation: 1, occurredAt: -1 },
  { name: "operation_1_occurredAt_-1" },
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
