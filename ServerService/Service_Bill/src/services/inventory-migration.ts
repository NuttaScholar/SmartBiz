import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
import { ProductDocument } from "../models/product.interface";
import { OrderStatus } from "../utils/enum";

const pendingStatuses = [
  OrderStatus.Submitted,
  OrderStatus.PaymentNotified,
  OrderStatus.PaymentConfirmed,
  OrderStatus.PrepareProduct,
];

export async function migrateInventoryDetails(
  OrderModel: Model<OrderDocument>,
  ProductModel: Model<ProductDocument>,
) {
  const products = await ProductModel.find({ inventorySchemaVersion: { $ne: 2 } }).lean();
  if (products.length === 0) return;

  const pendingByProduct = await OrderModel.aggregate<{ _id: string; quantity: number }>([
    { $match: { status: { $in: pendingStatuses } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.productID", quantity: { $sum: "$items.quantity" } } },
  ]);
  const pending = new Map(pendingByProduct.map((item) => [item._id, item.quantity]));

  const writes = products.map((product) => {
    const amount = Number(product.amount ?? 0);
    const pendingDeliveryAmount = pending.get(product.id) ?? 0;
    const actualAmount = amount + pendingDeliveryAmount;
    if (!Number.isFinite(actualAmount) || actualAmount < 0) {
      throw new Error(`Cannot migrate inventory for ${product.id}: physical stock would be negative`);
    }
    return {
      updateOne: {
        filter: { _id: product._id, inventorySchemaVersion: { $ne: 2 } },
        update: { $set: { actualAmount, pendingDeliveryAmount, inventorySchemaVersion: 2 } },
      },
    };
  });

  await ProductModel.bulkWrite(writes);
}
