import { Model } from "mongoose";
import { OrderStatus } from "../utils/enum";
import { OrderDocument } from "../models/order.interface";

type OrderUpdateData = Partial<Pick<OrderDocument, "customerID" | "items" | "totalAmount">>;

export default class BillRepo {
  private OrderModel: Model<OrderDocument>;

  constructor(OrderModel: Model<OrderDocument>) {
    this.OrderModel = OrderModel;
  }

  async findByCustomerAndOrder(customerID?: string, orderID?: string, status?: number) {
    const query: any = {};

    if (customerID)
      query.customerID = { $regex: escapeRegex(customerID), $options: "i" };

    if (orderID)
      query.orderID = orderID;

    if (status !== undefined)
      query.status = status;

    return this.OrderModel.find(query).limit(100);
  }

  async countByStatus(customerID?: string, orderID?: string) {
    const match: any = {};

    if (customerID)
      match.customerID = { $regex: escapeRegex(customerID), $options: "i" };

    if (orderID)
      match.orderID = orderID;

    return this.OrderModel.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
      { $sort: { status: 1 } },
    ]);
  }

  async findByStatus(status: number) {
    return this.OrderModel.find({ status });
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
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
