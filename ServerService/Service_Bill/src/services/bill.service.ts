import BillRepo from "../repositories/bill.repo";
import { OrderStatus } from "../models/order.enum";
import { errorCode_e } from "../utils/enum";

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
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }

    const status = Number(order.status);
    if (isNaN(status)) {
      throw { code: errorCode_e.InvalidInputError, message: `Invalid status: ${order.status}` };
    }

    const currentIndex = WORKFLOW.indexOf(status);
    if (currentIndex === -1) {
      throw { code: errorCode_e.InvalidInputError, message: `Status ${status} is not in workflow` };
    }
    if (currentIndex === WORKFLOW.length - 1) {
      throw { code: errorCode_e.InvalidInputError, message: "Already at final step" };
    }

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
