import { Model } from "mongoose";
import { ContactForm_t } from "../type";
import { errorCode_e } from "../utils/enum";
import { ContactDocument } from "../models/contact.interface";
import { TransactionDocument } from "../models/transaction.interface";
import ContactRepo from "../repositories/contact.repo";
import TransactionRepo from "../repositories/transaction.repo";

export default class ContactService {
  private contactRepo: ContactRepo;
  private transactionRepo: TransactionRepo;

  constructor(
    ContactModel: Model<ContactDocument>,
    TransactionModel: Model<TransactionDocument>
  ) {
    this.contactRepo = new ContactRepo(ContactModel);
    this.transactionRepo = new TransactionRepo(TransactionModel);
  }

  async createContact(data: ContactForm_t) {
    const duplicate = await this.contactRepo.findByCodeName(data.codeName);
    if (duplicate) {
      throw { code: errorCode_e.InUseError, message: "Contact codeName already exists" };
    }

    await this.contactRepo.create(data);
  }

  searchContacts(id?: string, index?: string, size?: string) {
    return this.contactRepo.search(
      id,
      this.parseOptionalPageNumber(index, 0),
      this.parseOptionalPageNumber(size)
    );
  }

  async updateContact(data: ContactForm_t) {
    const { codeName, ...newData } = data;
    const updateRes = await this.contactRepo.updateByCodeName(codeName, newData);
    if (!updateRes.matchedCount) {
      throw { code: errorCode_e.NotFoundError, message: "Contact not found" };
    }
  }

  async deleteContact(id?: string) {
    const exists = await this.transactionRepo.findByContact(id);
    if (exists.length) {
      throw { code: errorCode_e.InUseError, message: "Contact is used by transactions" };
    }

    await this.contactRepo.deleteByCodeName(id);
  }

  private parseOptionalPageNumber(value: unknown, defaultValue?: number) {
    if (value === undefined || value === null || value === "") return defaultValue;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) return defaultValue;
    return parsed;
  }
}
