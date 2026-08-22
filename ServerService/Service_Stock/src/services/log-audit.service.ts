import { FilterQuery, Model, Types } from "mongoose";
import {
  AuditAction,
  AuditOperation,
  LogAuditDocument,
  LogAuditQueryResult,
  LogAuditView,
} from "../models/log-audit.interface";
import LogAuditRepo from "../repositories/log-audit.repo";
import { errorCode_e } from "../utils/enum";

export type LogAuditQuery = {
  productID?: string;
  action?: string;
  operation?: string;
  actorName?: string;
  actorType?: string;
  from?: string;
  to?: string;
  minBeforeAmount?: string;
  maxBeforeAmount?: string;
  minAfterAmount?: string;
  maxAfterAmount?: string;
  page?: string;
  size?: string;
};

const AUDIT_ACTIONS = new Set<AuditAction>(["CREATE", "UPDATE", "DELETE"]);
const AUDIT_OPERATIONS = new Set<AuditOperation>([
  "PRODUCT_CREATE",
  "PRODUCT_UPDATE",
  "PRODUCT_DELETE",
  "STOCK_IN",
  "STOCK_OUT",
]);
const ACTOR_TYPES = new Set(["user", "service"]);

export default class LogAuditService {
  private repo: LogAuditRepo;

  constructor(LogAuditModel: Model<LogAuditDocument>) {
    this.repo = new LogAuditRepo(LogAuditModel);
  }

  async getById(id: string): Promise<LogAuditView> {
    if (!Types.ObjectId.isValid(id)) throw invalidInput("Invalid log audit id");
    const log = await this.repo.findById(id);
    if (!log) {
      throw { code: errorCode_e.NotFoundError, message: "Log audit not found" };
    }
    return toView(log);
  }

  async query(query: LogAuditQuery): Promise<LogAuditQueryResult> {
    const page = parsePositiveInteger(query.page, "page", 1);
    const size = parsePositiveInteger(query.size, "size", 20);
    if (size > 100) throw invalidInput("size must not exceed 100");

    const filter: FilterQuery<LogAuditDocument> = {};
    const productID = partialTextPattern(query.productID);
    if (productID) filter.productID = productID;

    if (query.action) {
      const action = query.action.toUpperCase() as AuditAction;
      if (!AUDIT_ACTIONS.has(action)) {
        throw invalidInput("action must be CREATE, UPDATE, or DELETE");
      }
      filter.action = action;
    }

    if (query.operation) {
      const operation = query.operation.toUpperCase() as AuditOperation;
      if (!AUDIT_OPERATIONS.has(operation)) {
        throw invalidInput(
          "operation must be PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE, STOCK_IN, or STOCK_OUT",
        );
      }
      filter.operation = operation;
    }

    if (query.actorType) {
      if (!ACTOR_TYPES.has(query.actorType)) {
        throw invalidInput("actorType must be user or service");
      }
      filter["actor.type"] = query.actorType;
    }
    const actorName = partialTextPattern(query.actorName);
    if (actorName) filter["actor.name"] = actorName;

    const occurredAt = buildDateRange(query.from, query.to);
    if (occurredAt) filter.occurredAt = occurredAt;
    addNumberRange(filter, "productBefore.amount", query.minBeforeAmount, query.maxBeforeAmount);
    addNumberRange(filter, "productAfter.amount", query.minAfterAmount, query.maxAfterAmount);

    const { logs, total } = await this.repo.query(filter, page, size);
    return {
      logs: logs.map(toView),
      page,
      size,
      total,
      hasMore: page * size < total,
    };
  }
}

function toView(log: any): LogAuditView {
  return {
    id: log._id.toString(),
    productID: log.productID,
    action: log.action,
    operation: log.operation,
    actor: log.actor,
    affectedCollections: log.affectedCollections,
    changedFields: log.changedFields,
    productBefore: log.productBefore,
    productAfter: log.productAfter,
    stockLog: log.stockLog,
    occurredAt: log.occurredAt,
    expiresAt: log.expiresAt,
  };
}

function parsePositiveInteger(value: string | undefined, name: string, fallback: number) {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw invalidInput(`${name} must be a positive integer`);
  }
  return number;
}

function buildDateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  const range: { $gte?: Date; $lte?: Date } = {};
  if (from) range.$gte = parseDate(from, "from");
  if (to) range.$lte = parseDate(to, "to");
  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    throw invalidInput("from must be before or equal to to");
  }
  return range;
}

function parseDate(value: string, name: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw invalidInput(`Invalid ${name} date`);
  return date;
}

function addNumberRange(
  filter: FilterQuery<LogAuditDocument>,
  field: "productBefore.amount" | "productAfter.amount",
  min?: string,
  max?: string,
) {
  if (min === undefined && max === undefined) return;
  const range: { $gte?: number; $lte?: number } = {};
  if (min !== undefined) range.$gte = parseNumber(min, `min ${field}`);
  if (max !== undefined) range.$lte = parseNumber(max, `max ${field}`);
  if (range.$gte !== undefined && range.$lte !== undefined && range.$gte > range.$lte) {
    throw invalidInput(`min ${field} must not exceed max ${field}`);
  }
  filter[field] = range;
}

function parseNumber(value: string, name: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw invalidInput(`${name} must be a number`);
  return number;
}

function partialTextPattern(value?: string) {
  const normalized = value?.trim();
  return normalized
    ? new RegExp(escapeRegex(normalized), "i")
    : undefined;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function invalidInput(message: string) {
  return { code: errorCode_e.InvalidInputError, message };
}
