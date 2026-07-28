import { Response } from "express";
import { Model } from "mongoose";
import { ContactDocument } from "../models/contact.interface";
import { TransactionDocument } from "../models/transaction.interface";
import {
  AuthRequest,
  hasServiceScope,
  isUserWithRole,
} from "../middlewares/auth";
import { ContactForm_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";
import { error, success } from "../utils/response";
import ContactService from "../services/contact.service";

export default class ContactController {
  private service: ContactService;

  constructor(
    ContactModel: Model<ContactDocument>,
    TransactionModel: Model<TransactionDocument>
  ) {
    this.service = new ContactService(ContactModel, TransactionModel);
  }

  async createContact(req: AuthRequest, res: Response) {
    try {
      if (!requireContactEditor(req, res, "account.contact.write")) return;

      await this.service.createContact(req.body as ContactForm_t);
      return res.json(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async searchContacts(req: AuthRequest, res: Response) {
    try {
      if (!requireContactEditor(req, res, "account.contact.read")) return;

      const { id, index, size } = req.query;
      const result = await this.service.searchContacts(
        id as string,
        index as string,
        size as string
      );

      const data = result.size !== undefined
        ? {
            contacts: result.data,
            index: result.index,
            size: result.size,
            total: result.total,
            hasMore: result.hasMore,
          }
        : result.data;

      return res.json(success<"getContact">(data));
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateContact(req: AuthRequest, res: Response) {
    try {
      if (!requireContactEditor(req, res, "account.contact.write")) return;

      await this.service.updateContact(req.body as ContactForm_t);
      return res.json(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteContact(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res, "account.contact.delete")) return;

      await this.service.deleteContact(req.query.id as string);
      return res.json(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response, scope: string) {
  if (
    isUserWithRole(req, [role_e.admin])
    || hasServiceScope(req, scope)
  ) return true;

  res.status(403).json(error<"none">(errorCode_e.PermissionDeniedError, "You do not have permission to access this resource"));
  return false;
}

function requireContactEditor(
  req: AuthRequest,
  res: Response,
  scope: string,
) {
  if (
    isUserWithRole(req, [role_e.admin, role_e.cashier])
    || hasServiceScope(req, scope)
  ) {
    return true;
  }

  res.status(403).json(error<"none">(errorCode_e.PermissionDeniedError, "You do not have permission to access this resource"));
  return false;
}

function handleError(res: Response, err: any) {
  console.error(err);
  const errCode = err?.code || errorCode_e.UnknownError;
  return res.status(err?.code ? 400 : 500).json(error<"none">(errCode, err?.message || "Unknown error"));
}
