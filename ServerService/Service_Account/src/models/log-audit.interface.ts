import { Document, Types } from "mongoose";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditActor = {
  type: "user" | "service";
  name: string;
};

export type TransactionSnapshot = {
  date: Date;
  topic: string;
  type: number;
  money: number;
  description?: string;
  who?: string;
  bill?: string;
  readonly: boolean;
};

export interface LogAuditDocument extends Document {
  transactionId: Types.ObjectId;
  action: AuditAction;
  actor: AuditActor;
  affectedCollections: ["transactions", "wallets"];
  changedFields: string[];
  transactionBefore: TransactionSnapshot | null;
  transactionAfter: TransactionSnapshot | null;
  wallet: {
    name: string;
    beforeAmount: number;
    afterAmount: number;
  };
  occurredAt: Date;
  expiresAt: Date;
}

export type LogAuditView = {
  id: string;
  transactionId: string;
  action: AuditAction;
  actor: AuditActor;
  affectedCollections: string[];
  changedFields: string[];
  transactionBefore: TransactionSnapshot | null;
  transactionAfter: TransactionSnapshot | null;
  wallet: {
    name: string;
    beforeAmount: number;
    afterAmount: number;
  };
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
