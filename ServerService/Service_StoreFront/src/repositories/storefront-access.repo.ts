import type { Model } from "mongoose";
import type { StorefrontAccessDocument } from "../models/storefront-access.interface";

export default class StorefrontAccessRepo {
  constructor(
    private readonly model: Model<StorefrontAccessDocument>,
  ) {}

  findActiveByToken(token: string) {
    return this.model.findOne({
      token,
      isActive: true,
    });
  }

  findByCustomerID(customerID: string) {
    return this.model.findOne({ customerID });
  }

  findByCustomerIDWithToken(customerID: string) {
    return this.model.findOne({ customerID }).select("+token");
  }

  create(data: {
    customerID: string;
    customerName: string;
    token: string;
  }) {
    return this.model.create({
      ...data,
      isActive: true,
      productDiscounts: [],
    });
  }

  rotateToken(
    customerID: string,
    customerName: string,
    token: string,
  ) {
    return this.model.findOneAndUpdate(
      { customerID },
      {
        $set: {
          customerName,
          token,
          isActive: true,
        },
      },
      { new: true, runValidators: true },
    );
  }
}
