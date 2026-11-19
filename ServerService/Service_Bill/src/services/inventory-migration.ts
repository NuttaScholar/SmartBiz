import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
import { ProductDocument } from "../models/product.interface";
import { OrderStatus, stockStatus_e } from "../utils/enum";

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
    const orderPendingAmount = pending.get(product.id) ?? 0;
    if (!Number.isFinite(amount) || !Number.isFinite(orderPendingAmount)) {
      throw new Error(`Cannot migrate inventory for ${product.id}: invalid quantity`);
    }
    const pendingDeliveryAmount = Math.max(orderPendingAmount, -amount);
    const actualAmount = amount + pendingDeliveryAmount;
    if (pendingDeliveryAmount > orderPendingAmount) {
      console.warn(
        `Inventory migration for ${product.id}: carrying ${pendingDeliveryAmount - orderPendingAmount} legacy units without an active pending order`,
      );
    }
    const status = amount < 0
      ? stockStatus_e.preOrder
      : actualAmount === 0
        ? stockStatus_e.stockOut
        : amount < Number(product.condition ?? 0)
          ? stockStatus_e.stockLow
          : stockStatus_e.normal;
    return {
      updateOne: {
        filter: { _id: product._id, inventorySchemaVersion: { $ne: 2 } },
        update: { $set: { actualAmount, pendingDeliveryAmount, status, inventorySchemaVersion: 2 } },
      },
    };
  });

  await ProductModel.bulkWrite(writes);
}
