import type { PaymentConfirmationResult, StorefrontOrder } from "../type";
import AppError from "../utils/app-error";
import { orderStatus_e } from "../utils/enum";
import type { BillGateway } from "./bill-client.service";
import type { EvidenceStorage } from "./storefront.service";

export default class AdminOrderService {
  constructor(
    private readonly billGateway: BillGateway,
    private readonly evidenceStorage: EvidenceStorage,
  ) {}

  async listPaymentConfirmations(): Promise<StorefrontOrder[]> {
    const orders = await this.billGateway.listPaymentConfirmations();

    return Promise.all(orders.map((order) => this.mapOrder(order)));
  }

  async getOrder(orderID: unknown, customerID: unknown): Promise<StorefrontOrder> {
    const normalizedOrderID = this.requireText(orderID, "orderID");
    const normalizedCustomerID = this.requireText(customerID, "customerID");
    const orders = await this.billGateway.listOnlineOrders(
      normalizedCustomerID,
      normalizedOrderID,
    );
    const order = orders.find((item) => item.orderID === normalizedOrderID);
    if (!order) throw new AppError("Order not found", 404);

    return this.mapOrder(order);
  }

  private async mapOrder(
    order: Awaited<ReturnType<BillGateway["listPaymentConfirmations"]>>[number],
  ): Promise<StorefrontOrder> {
    const evidence = order.confirmationEvidence;
    return {
      id: order.orderID,
      customerID: order.customerID,
      date: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      ...(evidence
        ? { confirmationEvidence: {
            fileName: evidence.fileName,
            mimeType: evidence.mimeType,
            dataUrl: await this.evidenceStorage.getEvidenceUrl(evidence.objectKey),
            updatedAt: evidence.updatedAt,
          } }
        : {}),
      items: order.items,
    };
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
