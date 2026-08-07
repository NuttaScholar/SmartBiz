import { Model } from "mongoose";
import { OrderSource, OrderStatus } from "../utils/enum";
import { OrderDocument } from "../models/order.interface";
import type { StoredConfirmationEvidence } from "../models/order.interface";

type OrderUpdateData = Partial<Pick<OrderDocument, "customerID" | "items" | "totalAmount">>;

export default class BillRepo {
  private OrderModel: Model<OrderDocument>;

  constructor(OrderModel: Model<OrderDocument>) {
    this.OrderModel = OrderModel;
  }

  async findByCustomerAndOrder(customerID?: string, orderID?: string, status?: number, source?: OrderSource) {
    const query: any = {};

    if (customerID)
      query.customerID = { $regex: escapeRegex(customerID), $options: "i" };

    if (orderID)
      query.orderID = orderID;

    if (status !== undefined)
      query.status = status;

    if (source)
      query.source = sourceFilter(source);

    return this.OrderModel.find(query).limit(100);
  }

  async countByStatus(customerID?: string, orderID?: string, source?: OrderSource) {
    const match: any = {};

    if (customerID)
      match.customerID = { $regex: escapeRegex(customerID), $options: "i" };

    if (orderID)
      match.orderID = orderID;

    if (source)
      match.source = sourceFilter(source);

    return this.OrderModel.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]);
  }

  async findByStatus(status: number, source?: OrderSource) {
    return this.OrderModel.find({
      status,
      ...(source ? { source: sourceFilter(source) } : {}),
    }).sort({ createdAt: -1 });
  }

  async countByProduct(productID: string) {
    return this.OrderModel.countDocuments({ "items.productID": productID });
  }

  async createOrder(data: any) {
    const order = new this.OrderModel(data);
    return order.save();
  }

  async updateOrder(orderID: string, data: OrderUpdateData) {
    return this.OrderModel.findOneAndUpdate(
      { orderID },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async deleteOrder(orderID: string) {
    return this.OrderModel.findOneAndDelete({ orderID });
  }

  async updateStatus(orderID: string, status: OrderStatus) {
    return this.OrderModel.findOneAndUpdate(
      { orderID },
      { status },
      { new: true, runValidators: true }
    );
  }

  async getOrder(orderID: string) {
    return this.OrderModel.findOne({ orderID });
  }

  async findOnlineByCustomer(customerID: string, orderID?: string) {
    return this.OrderModel.find({
      customerID,
      source: OrderSource.Online,
      ...(orderID ? { orderID } : {}),
    }).sort({ createdAt: -1 });
  }

  async updateOnlineEvidence(
    customerID: string,
    orderID: string,
    evidence: StoredConfirmationEvidence,
  ) {
    return this.OrderModel.findOneAndUpdate(
      {
        customerID,
        orderID,
        source: OrderSource.Online,
        status: { $in: [OrderStatus.Submitted, OrderStatus.PaymentNotified] },
      },
      {
        $set: {
          confirmationEvidence: evidence,
          status: OrderStatus.PaymentNotified,
        },
      },
      { new: true, runValidators: true },
    );
  }

  async cancelOnline(customerID: string, orderID: string) {
    return this.OrderModel.findOneAndUpdate(
      {
        customerID,
        orderID,
        source: OrderSource.Online,
        status: OrderStatus.Submitted,
      },
      { $set: { status: OrderStatus.Cancelled } },
      { new: true, runValidators: true },
    );
  }

  async cancelOnlineByAdmin(orderID: string) {
    return this.OrderModel.findOneAndUpdate(
      {
        orderID,
        source: OrderSource.Online,
        status: { $in: [OrderStatus.Submitted, OrderStatus.PaymentNotified] },
      },
      { $set: { status: OrderStatus.Cancelled } },
      { new: true, runValidators: true },
    );
  }

  async confirmOnlinePayment(
    orderID: string,
    paymentConfirmedBy: string,
    paymentConfirmedAt: Date,
  ) {
    return this.OrderModel.findOneAndUpdate(
      {
        orderID,
        source: OrderSource.Online,
        status: OrderStatus.PaymentNotified,
      },
      {
        $set: {
          status: OrderStatus.PrepareProduct,
          paymentConfirmedBy,
          paymentConfirmedAt,
        },
      },
      { new: true, runValidators: true },
    );
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sourceFilter(source: OrderSource) {
  return source === OrderSource.Direct
    ? { $in: [OrderSource.Direct, null] }
    : source;
}
