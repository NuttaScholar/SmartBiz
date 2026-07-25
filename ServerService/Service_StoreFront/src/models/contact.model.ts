import { Schema } from "mongoose";
import type { ContactDocument } from "./contact.interface";

export const ContactSchema = new Schema<ContactDocument>({
  codeName: { type: String, required: true, unique: true },
  billName: { type: String, required: true },
  address: String,
  tel: String,
  taxID: String,
  description: String,
});
