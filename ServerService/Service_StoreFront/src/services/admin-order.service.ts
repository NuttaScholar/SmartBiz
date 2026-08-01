import type { PaymentConfirmationResult, StorefrontOrder } from "../type";
import AppError from "../utils/app-error";
import { orderStatus_e } from "../utils/enum";
import type { BillGateway } from "./bill-client.service";

export default class AdminOrderService {
  constructor(
    private readonly billGateway: BillGateway,
  ) {}

  async listPaymentConfirmations(): Promise<StorefrontOrder[]> {
    const orders = await this.billGateway.listPaymentConfirmations();

    return orders.map((order) => ({
      id: order.orderID,
      customerID: order.customerID,
      date: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.items,
    }));
  }

  async confirmPayment(
    orderID: unknown,
    confirmedBy: unknown,
  ): Promise<PaymentConfirmationResult> {
    const normalizedOrderID = this.requireText(orderID, "orderID");
    const normalizedConfirmedBy = this.requireText(
      confirmedBy,
      "admin username",
    );
    const updated = await this.billGateway.confirmPayment(
      normalizedOrderID,
      normalizedConfirmedBy,
    );
    return {
      orderID: updated.orderID,
      billOrderID: updated.orderID,
      status: orderStatus_e.PrepareProduct,
      paymentConfirmedAt: updated.paymentConfirmedAt,
      paymentConfirmedBy: updated.paymentConfirmedBy,
    };
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new AppError(`${fieldName} is required`, 400);
    }
    return value.trim();
  }
}
