import Order from "../models/order.model";
import { OrderStatus } from "../models/order.enum";

export default {
  findByCustomerAndOrder(customerName?: string, orderID?: string) {
    const query: any = {};

    if (customerName)
      query.customerName = { $regex: customerName, $options: "i" };

    if (orderID)
      query.orderID = orderID;

    return Order.find(query);
  },

  findByStatus(status: number) {
    return Order.find({ status });
  },

  createOrder(data: any) {
    return Order.create(data);
  },

  updateOrder(orderID: string, data: any) {
    return Order.findOneAndUpdate({ orderID }, data, { new: true });
  },

  deleteOrder(orderID: string) {
    return Order.deleteOne({ orderID });
  },

  updateStatus(orderID: string, status: OrderStatus) {
    return Order.findOneAndUpdate(
      { orderID },
      { status },
      { new: true }
    );
  },

  getOrder(orderID: string) {
    return Order.findOne({ orderID });
  }
};
