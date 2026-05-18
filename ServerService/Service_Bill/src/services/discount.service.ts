import { Model } from "mongoose";
import DiscountRepo from "../repositories/discount.repo";
import { errorCode_e } from "../utils/enum";
import { DiscountDocument } from "../models/discount.interface";

export default class DiscountService {
  private repo: DiscountRepo;

  constructor(DiscountModel: Model<DiscountDocument>) {
    this.repo = new DiscountRepo(DiscountModel);
  }

  async getDiscounts(customerID: string) {
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
    if (!Array.isArray(discounts)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Discount list must be an array"
      };
    }

    return this.repo.updateByCustomer(customerID, discounts);
  }
}

