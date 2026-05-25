import { Response } from "express";
import { Model } from "mongoose";
import { ContactDocument } from "../models/contact.interface";
import { TransactionDocument } from "../models/transaction.interface";
import { AuthRequest } from "../middlewares/auth";
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
      if (!requireAdmin(req, res)) return;

      await this.service.createContact(req.body as ContactForm_t);
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async searchContacts(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      const { id, index, size } = req.query;
      const result = await this.service.searchContacts(
        id as string,
        index as string,
        size as string
      );

      return res.send({
        ...success<"getContact">(result.data),
        ...(result.size !== undefined
          ? {
              index: result.index,
              size: result.size,
              total: result.total,
              hasMore: result.hasMore,
            }
          : {}),
      });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateContact(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      await this.service.updateContact(req.body as ContactForm_t);
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteContact(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      await this.service.deleteContact(req.query.id as string);
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response) {
  if (req.authData?.role === role_e.admin) return true;

  res.send(error<"none">(errorCode_e.PermissionDeniedError));
  return false;
}

function handleError(res: Response, err: any) {
  console.error(err);
  return res.send(error<"none">(err?.code || errorCode_e.UnknownError));
}
