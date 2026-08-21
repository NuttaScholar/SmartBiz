import { Document } from "mongoose";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditOperation =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "STOCK_IN"
  | "STOCK_OUT";

export type AuditActor = {
  type: "user" | "service";
  name: string;
};

export type ProductSnapshot = {
  id: string;
  type: number;
  name: string;
  condition: number;
  img?: string;
  status?: number;
  price?: number;
  description?: string;
  amount?: number;
};

export type StockLogSnapshot = {
  amount: number;
  type: number;
  date: Date;
  price?: number;
  bill?: string;
  note?: string;
  reference?: string;
};

export interface LogAuditDocument extends Document {
  productID: string;
  action: AuditAction;
  operation: AuditOperation;
  actor: AuditActor;
  affectedCollections: string[];
  changedFields: string[];
  productBefore: ProductSnapshot | null;
  productAfter: ProductSnapshot | null;
  stockLog: StockLogSnapshot | null;
  occurredAt: Date;
  expiresAt: Date;
}

export type LogAuditView = {
  id: string;
  productID: string;
  action: AuditAction;
  operation: AuditOperation;
  actor: AuditActor;
  affectedCollections: string[];
  changedFields: string[];
  productBefore: ProductSnapshot | null;
  productAfter: ProductSnapshot | null;
  stockLog: StockLogSnapshot | null;
  occurredAt: Date;
  expiresAt: Date;
};

export type LogAuditQueryResult = {
  logs: LogAuditView[];
  page: number;
  size: number;
  total: number;
  hasMore: boolean;
};
