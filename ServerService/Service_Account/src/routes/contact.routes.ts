import { Router } from "express";
import { Model } from "mongoose";
import { ContactDocument } from "../models/contact.interface";
import { TransactionDocument } from "../models/transaction.interface";
import ContactController from "../controllers/contact.controller";

export default function contactRoutes(
  ContactModel: Model<ContactDocument>,
  TransactionModel: Model<TransactionDocument>
) {
  const router = Router();
  const controller = new ContactController(ContactModel, TransactionModel);

  router.post("/", (req, res) => controller.createContact(req, res));
  router.get("/", (req, res) => controller.searchContacts(req, res));
  router.put("/", (req, res) => controller.updateContact(req, res));
  router.delete("/", (req, res) => controller.deleteContact(req, res));

  return router;
}
