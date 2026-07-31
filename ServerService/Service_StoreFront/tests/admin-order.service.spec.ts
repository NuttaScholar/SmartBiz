import AdminOrderService from "../src/services/admin-order.service";
import { orderStatus_e } from "../src/utils/enum";

describe("AdminOrderService", () => {
  const fixedNow = new Date("2026-07-28T04:00:00.000Z");
  const paymentNotifiedOrder = {
    orderID: "SO-260728-ABCDEF01",
    customerID: "CUST-001",
    status: orderStatus_e.PaymentNotified,
    items: [
      {
        productID: "P-001",
        name: "Product One",
        quantity: 2,
        priceOriginal: 100,
        discountPercent: 10,
        priceAfterDiscount: 90,
        img: "",
      },
    ],
    totalAmount: 180,
    createdAt: fixedNow,
  };

  function createService(order: {
    orderID: string;
    customerID: string;
    status: orderStatus_e;
    items: typeof paymentNotifiedOrder.items;
    totalAmount: number;
    paymentConfirmedAt?: Date;
    paymentConfirmedBy?: string;
  } = paymentNotifiedOrder) {
    const orderRepo = {
      listByStatus: jasmine
        .createSpy("listByStatus")
        .and.resolveTo([order]),
      findByOrderID: jasmine
        .createSpy("findByOrderID")
        .and.resolveTo(order),
      confirmPayment: jasmine
        .createSpy("confirmPayment")
        .and.resolveTo({
          ...order,
          status: orderStatus_e.PaymentConfirmed,
          paymentConfirmedAt: fixedNow,
          paymentConfirmedBy: "admin",
        }),
    };
    const billGateway = {
      createOrder: jasmine
        .createSpy("createOrder")
        .and.resolveTo({ orderID: order.orderID }),
    };
    const service = new AdminOrderService(
      orderRepo as any,
      billGateway,
      () => fixedNow,
    );

    return { service, orderRepo, billGateway };
  }

  it("lists only orders waiting for payment confirmation", async () => {
    const { service, orderRepo } = createService();

    const result = await service.listPaymentConfirmations();

    expect(orderRepo.listByStatus)
      .toHaveBeenCalledWith(orderStatus_e.PaymentNotified);
    expect(result).toEqual([{
      id: paymentNotifiedOrder.orderID,
      customerID: paymentNotifiedOrder.customerID,
      date: fixedNow,
      status: orderStatus_e.PaymentNotified,
      totalAmount: paymentNotifiedOrder.totalAmount,
      items: paymentNotifiedOrder.items,
    }]);
  });

  it("creates the Bill order before confirming the payment", async () => {
    const { service, orderRepo, billGateway } = createService();

    const result = await service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "admin",
    );

    expect(billGateway.createOrder).toHaveBeenCalledWith(
      {
        orderID: paymentNotifiedOrder.orderID,
        customerID: "CUST-001",
        items: paymentNotifiedOrder.items,
        totalAmount: 180,
      },
    );
    expect(orderRepo.confirmPayment).toHaveBeenCalledWith(
      paymentNotifiedOrder.orderID,
      "admin",
      fixedNow,
    );
    expect(result).toEqual({
      orderID: paymentNotifiedOrder.orderID,
      billOrderID: paymentNotifiedOrder.orderID,
      status: orderStatus_e.PaymentConfirmed,
      paymentConfirmedAt: fixedNow,
      paymentConfirmedBy: "admin",
    });
  });

  it("does not confirm when Bill Service rejects the order", async () => {
    const { service, orderRepo, billGateway } = createService();
    billGateway.createOrder.and.rejectWith(
      new Error("Insufficient stock"),
    );

    await expectAsync(service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "admin",
    )).toBeRejectedWithError("Insufficient stock");
    expect(orderRepo.confirmPayment).not.toHaveBeenCalled();
  });

  it("rejects an order that has no payment notification", async () => {
    const { service, orderRepo, billGateway } = createService({
      ...paymentNotifiedOrder,
      status: orderStatus_e.Submitted,
    });

    await expectAsync(service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "admin",
    )).toBeRejectedWithError(
      "Only an order with payment evidence can be confirmed",
    );
    expect(billGateway.createOrder).not.toHaveBeenCalled();
    expect(orderRepo.confirmPayment).not.toHaveBeenCalled();
  });

  it("is idempotent after payment has already been confirmed", async () => {
    const confirmedAt = new Date("2026-07-28T03:00:00.000Z");
    const { service, orderRepo, billGateway } = createService({
      ...paymentNotifiedOrder,
      status: orderStatus_e.PaymentConfirmed,
      paymentConfirmedAt: confirmedAt,
      paymentConfirmedBy: "first-admin",
    });

    const result = await service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "second-admin",
    );

    expect(result.paymentConfirmedAt).toEqual(confirmedAt);
    expect(result.paymentConfirmedBy).toBe("first-admin");
    expect(billGateway.createOrder).not.toHaveBeenCalled();
    expect(orderRepo.confirmPayment).not.toHaveBeenCalled();
  });
});
