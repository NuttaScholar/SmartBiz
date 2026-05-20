import { Model } from "mongoose";
import DiscountRepo from "../repositories/discount.repo";
import { errorCode_e } from "../utils/enum";
import { DiscountDocument } from "../models/discount.interface";
import ContactRepo from "../repositories/contact.repo";
import { ContactDocument } from "../models/contact.interface";

export default class DiscountService {
  private repo: DiscountRepo;
  private contactRepo: ContactRepo;

  constructor(DiscountModel: Model<DiscountDocument>, ContactModel: Model<ContactDocument>) {
    this.repo = new DiscountRepo(DiscountModel);
    this.contactRepo = new ContactRepo(ContactModel);
  }

  async getDiscounts(customerID: string) {
    await this.ensureCustomerExists(customerID);
    const data = await this.repo.getByCustomer(customerID);

    if (!data) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "No discount data for this customer"
      };
    }

    return data;
  }

  async updateDiscounts(customerID: string, discounts: any[]) {
    await this.ensureCustomerExists(customerID);

    if (!Array.isArray(discounts)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Discount list must be an array"
      };
    }

    return this.repo.updateByCustomer(customerID, discounts);
  }

  private async ensureCustomerExists(customerID?: string) {
    if (!customerID) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "customerID is required"
      };
    }

    const contact = await this.contactRepo.findByCodeName(customerID);
    if (!contact) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "Customer contact not found"
      };
    }
  }
}

