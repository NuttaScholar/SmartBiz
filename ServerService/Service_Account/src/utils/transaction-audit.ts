import { LOG_AUDIT_RETENTION_DAYS } from "../config";
import { TransactionSnapshot } from "../models/log-audit.interface";
import { TransactionDocument } from "../models/transaction.interface";

const SNAPSHOT_FIELDS: Array<keyof TransactionSnapshot> = [
  "date",
  "topic",
  "type",
  "money",
  "description",
  "who",
  "bill",
  "readonly",
];

export function toTransactionSnapshot(
  transaction: TransactionDocument,
): TransactionSnapshot {
  return {
    date: transaction.date,
    topic: transaction.topic,
    type: transaction.type,
    money: transaction.money,
    description: transaction.description,
    who: transaction.who,
    bill: transaction.bill,
    readonly: transaction.readonly,
  };
}

export function getChangedFields(
  before: TransactionSnapshot | null,
  after: TransactionSnapshot | null,
) {
  if (!before) {
    return SNAPSHOT_FIELDS.filter((field) => after?.[field] !== undefined);
  }
  if (!after) return [];

  return SNAPSHOT_FIELDS.filter((field) => {
    const beforeValue = before[field];
    const afterValue = after[field];
    if (beforeValue instanceof Date && afterValue instanceof Date) {
      return beforeValue.getTime() !== afterValue.getTime();
    }
    return beforeValue !== afterValue;
  });
}

export function getAuditDates() {
  const occurredAt = new Date();
  const expiresAt = new Date(occurredAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + LOG_AUDIT_RETENTION_DAYS);
  return { occurredAt, expiresAt };
}
