import BillRepo from "../repositories/bill.repo";
import { OrderStatus } from "../models/order.enum";

const WORKFLOW = [
    OrderStatus.Pending,
    OrderStatus.Processing,
    OrderStatus.Billing,
    OrderStatus.Completed
];

export default {
  searchOrders(customerName?: string, orderID?: string) {
    return BillRepo.findByCustomerAndOrder(customerName, orderID);
  },

  getOrdersByStatus(status: OrderStatus) {
    return BillRepo.findByStatus(status);
  },

  createOrder(data: any) {
    return BillRepo.createOrder(data);
  },

  updateOrder(orderID: string, data: any) {
    return BillRepo.updateOrder(orderID, data);
  },

  deleteOrder(orderID: string) {
    return BillRepo.deleteOrder(orderID);
  },

  async moveToNextStep(orderID: string) {
        const order = await BillRepo.getOrder(orderID);
        if (!order) throw new Error("Order not found");

        const currentIndex = WORKFLOW.indexOf(order.status);
        if (currentIndex === -1 || currentIndex === WORKFLOW.length - 1)
            throw new Error("Cannot move to next step");

        const nextStatus = WORKFLOW[currentIndex + 1];
        return BillRepo.updateStatus(orderID, nextStatus);
    },

  markAsIncome(orderID: string) {
    return BillRepo.updateStatus(orderID, OrderStatus.IncomeRecorded);
  },

  markAsDebt(orderID: string) {
    return BillRepo.updateStatus(orderID, OrderStatus.DebtRecorded);
  },

  getStatus(orderID: string) {
    return BillRepo.getOrder(orderID);
  }
};
