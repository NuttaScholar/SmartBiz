import StorefrontOrderRepo from "../repositories/storefront-order.repo";
import type { PaymentConfirmationResult } from "../type";
import AppError from "../utils/app-error";
import { orderStatus_e } from "../utils/enum";
import type { BillGateway } from "./bill-client.service";

export default class AdminOrderService {
  constructor(
    private readonly orderRepo: StorefrontOrderRepo,
    private readonly billGateway: BillGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async confirmPayment(
    orderID: unknown,
    confirmedBy: unknown,
  ): Promise<PaymentConfirmationResult> {
    const normalizedOrderID = this.requireText(orderID, "orderID");
    const normalizedConfirmedBy = this.requireText(
      confirmedBy,
      "admin username",
    );
    const order = await this.orderRepo.findByOrderID(normalizedOrderID);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === orderStatus_e.PaymentConfirmed) {
      return {
        orderID: order.orderID,
        billOrderID: order.orderID,
        status: order.status,
        paymentConfirmedAt: order.paymentConfirmedAt,
        paymentConfirmedBy: order.paymentConfirmedBy,
      };
    }
    if (order.status !== orderStatus_e.PaymentNotified) {
      throw new AppError(
        "Only an order with payment evidence can be confirmed",
        409,
      );
    }

    const billOrder = await this.billGateway.createOrder(
      {
        orderID: order.orderID,
        customerID: order.customerID,
        items: order.items,
        totalAmount: order.totalAmount,
      },
    );
    const confirmedAt = this.now();
    const updated = await this.orderRepo.confirmPayment(
      normalizedOrderID,
      normalizedConfirmedBy,
      confirmedAt,
    );
    if (updated) {
      return {
        orderID: updated.orderID,
        billOrderID: billOrder.orderID,
        status: orderStatus_e.PaymentConfirmed,
        paymentConfirmedAt: updated.paymentConfirmedAt,
        paymentConfirmedBy: updated.paymentConfirmedBy,
      };
    }

    const latest = await this.orderRepo.findByOrderID(normalizedOrderID);
    if (latest?.status === orderStatus_e.PaymentConfirmed) {
      return {
        orderID: latest.orderID,
        billOrderID: billOrder.orderID,
        status: orderStatus_e.PaymentConfirmed,
        paymentConfirmedAt: latest.paymentConfirmedAt,
        paymentConfirmedBy: latest.paymentConfirmedBy,
      };
    }
    throw new AppError("Order payment status changed; please retry", 409);
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new AppError(`${fieldName} is required`, 400);
    }
    return value.trim();
  }
}
