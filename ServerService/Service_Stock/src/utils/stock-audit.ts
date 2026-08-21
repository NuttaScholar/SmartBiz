import { LOG_AUDIT_RETENTION_DAYS } from "../config";
import { ProductSnapshot } from "../models/log-audit.interface";
import { ProductDocument } from "../models/product.interface";

const SNAPSHOT_FIELDS: Array<keyof ProductSnapshot> = [
  "id",
  "type",
  "name",
  "condition",
  "img",
  "status",
  "price",
  "description",
  "amount",
];

export function toProductSnapshot(product: ProductDocument): ProductSnapshot {
  return {
    id: product.id,
    type: product.type,
    name: product.name,
    condition: product.condition,
    img: product.img,
    status: product.status,
    price: product.price,
    description: product.description,
    amount: product.amount,
  };
}

export function getChangedFields(
  before: ProductSnapshot | null,
  after: ProductSnapshot | null,
) {
  if (!before) {
    return SNAPSHOT_FIELDS.filter((field) => after?.[field] !== undefined);
  }
  if (!after) return [];
  return SNAPSHOT_FIELDS.filter((field) => before[field] !== after[field]);
}

export function getAuditDates() {
  const occurredAt = new Date();
  const expiresAt = new Date(occurredAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + LOG_AUDIT_RETENTION_DAYS);
  return { occurredAt, expiresAt };
}
