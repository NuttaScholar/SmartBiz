import type { Model } from "mongoose";
import type { StorefrontAccessDocument } from "../models/storefront-access.interface";

export default class StorefrontAccessRepo {
  constructor(
    private readonly model: Model<StorefrontAccessDocument>,
  ) {}

  findActiveByTokenHash(tokenHash: string) {
    return this.model.findOne({
      tokenHash,
      isActive: true,
    });
  }

  findByCustomerID(customerID: string) {
    return this.model.findOne({ customerID });
  }

  create(data: {
    customerID: string;
    customerName: string;
    token: string;
    tokenHash: string;
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
    tokenHash: string,
  ) {
    return this.model.findOneAndUpdate(
      { customerID },
      {
        $set: {
          customerName,
          token,
          tokenHash,
          isActive: true,
        },
      },
      { new: true, runValidators: true },
    );
  }
}
