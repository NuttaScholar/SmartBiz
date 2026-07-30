import type { Model } from "mongoose";
import type { DiscountDocument } from "../models/discount.interface";

export default class DiscountRepo {
  constructor(
    private readonly model: Model<DiscountDocument>,
  ) {}

  findByCustomerID(customerID: string) {
    return this.model.findOne({ customerID }).lean().exec();
  }

  findByCustomerIDs(customerIDs: string[]) {
    return this.model.find({
      customerID: { $in: customerIDs },
    }).lean().exec();
  }
}
