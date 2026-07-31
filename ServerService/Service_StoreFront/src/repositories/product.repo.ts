import type { Model } from "mongoose";
import type { ProductDocument } from "../models/product.interface";
import { productType_e } from "../utils/enum";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class ProductRepo {
  constructor(private readonly model: Model<ProductDocument>) {}

  listStorefrontProducts(query?: string) {
    const filter: Record<string, unknown> = {
      type: {
        $in: [
          productType_e.merchandise,
          productType_e.another,
        ],
      },
      price: { $gte: 0 },
    };

    if (query?.trim()) {
      const pattern = new RegExp(escapeRegex(query.trim()), "i");
      filter.$or = [{ id: pattern }, { name: pattern }];
    }

    return this.model.find(filter).sort({ name: 1 });
  }

  findByIds(productIDs: string[]) {
    return this.model.find({
      id: { $in: productIDs },
      type: {
        $in: [
          productType_e.merchandise,
          productType_e.another,
        ],
      },
      price: { $gte: 0 },
    });
  }
}
