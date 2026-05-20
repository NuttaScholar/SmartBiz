import { Model } from "mongoose";
import { ContactDocument } from "../models/contact.interface";

export default class ContactRepo {
  private ContactModel: Model<ContactDocument>;

  constructor(ContactModel: Model<ContactDocument>) {
    this.ContactModel = ContactModel;
  }

  findAll() {
    return this.ContactModel.find();
  }

  findByCodeName(codeName: string) {
    return this.ContactModel.findOne({ codeName });
  }

  search(keyword?: string) {
    const query = keyword
      ? {
          $or: [
            { codeName: { $regex: keyword, $options: "i" } },
            { billName: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    return this.ContactModel.find(query);
  }
}
