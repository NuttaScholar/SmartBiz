import { Model } from "mongoose";
import { OrderStatus } from "../models/order.enum";
import { OrderDocument } from "../models/order.interface";

type OrderUpdateData = Partial<Pick<OrderDocument, "customerID" | "items" | "totalAmount">>;

export default class BillRepo {
  private OrderModel: Model<OrderDocument>;

  constructor(OrderModel: Model<OrderDocument>) {
    this.OrderModel = OrderModel;
  }

  async findByCustomerAndOrder(customerID?: string, orderID?: string) {
    const query: any = {};

    if (customerID)
      query.customerID = { $regex: escapeRegex(customerID), $options: "i" };

    if (orderID)
      query.orderID = orderID;

    return this.OrderModel.find(query).limit(100);
  }

  async findByStatus(status: number) {
    return this.OrderModel.find({ status });
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
