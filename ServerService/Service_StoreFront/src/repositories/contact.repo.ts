import type { Model } from "mongoose";
import type { ContactDocument } from "../models/contact.interface";

export default class ContactRepo {
  constructor(private readonly model: Model<ContactDocument>) {}

  findByCodeName(codeName: string) {
    return this.model.findOne({ codeName });
  }
}
