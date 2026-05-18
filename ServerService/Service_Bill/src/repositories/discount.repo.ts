import { Model } from "mongoose";
import { DiscountDocument } from "../models/discount.interface";

export default class DiscountRepo {
  private DiscountModel: Model<DiscountDocument>;

  constructor(DiscountModel: Model<DiscountDocument>) {
    this.DiscountModel = DiscountModel;
  }
  getByCustomer(customerID: string) {
    return this.DiscountModel.findOne({ customerID });
  }

  updateByCustomer(customerID: string, discounts: any[]) {
    return this.DiscountModel.findOneAndUpdate(
      { customerID },
      { discounts },
      { new: true, upsert: true }
    );
  }
}

