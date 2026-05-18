import { Model } from "mongoose";
import { OrderStatus } from "../models/order.enum";
import { OrderDocument } from "../models/order.interface";

export default class BillRepo {
  private OrderModel: Model<OrderDocument>;

  constructor(OrderModel: Model<OrderDocument>) {
    this.OrderModel = OrderModel;
  }

  async findByCustomerAndOrder(customerName?: string, orderID?: string) {
    const query: any = {};

    if (customerName)
      query.customerName = { $regex: customerName, $options: "i" };

    if (orderID)
      query.orderID = orderID;

    return this.OrderModel.find(query);
  }

  async findByStatus(status: number) {
    return this.OrderModel.find({ status });
  }

  async createOrder(data: any) {
    const order = new this.OrderModel(data);
    return order.save();
  }

  async updateOrder(orderID: string, data: any) {
    return this.OrderModel.findOneAndUpdate({ orderID }, data, { new: true });
  }

  async deleteOrder(orderID: string) {
    return this.OrderModel.findOneAndDelete({ orderID });
  }

  async updateStatus(orderID: string, status: OrderStatus) {
    return this.OrderModel.findOneAndUpdate(
      { orderID },
      { status },
      { new: true }
    );
  }

  async getOrder(orderID: string) {
    return this.OrderModel.findOne({ orderID });
  }
}

