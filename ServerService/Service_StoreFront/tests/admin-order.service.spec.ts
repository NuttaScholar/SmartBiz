import AdminOrderService from "../src/services/admin-order.service";
import { orderStatus_e } from "../src/utils/enum";

describe("AdminOrderService", () => {
  const fixedNow = new Date("2026-07-28T04:00:00.000Z");
  const paymentNotifiedOrder = {
    orderID: "SO-260728-ABCDEF01",
    customerID: "CUST-001",
    source: "online" as const,
    status: orderStatus_e.PaymentNotified,
    items: [{
      productID: "P-001",
      name: "Product One",
      quantity: 2,
      priceOriginal: 100,
      discountPercent: 10,
      priceAfterDiscount: 90,
      img: "",
    }],
    totalAmount: 180,
    createdAt: fixedNow,
    updatedAt: fixedNow,
  };

  function createService() {
    const billGateway = {
      createOrder: jasmine.createSpy("createOrder"),
      listOnlineOrders: jasmine.createSpy("listOnlineOrders"),
      updateEvidence: jasmine.createSpy("updateEvidence"),
      cancelOrder: jasmine.createSpy("cancelOrder"),
      listPaymentConfirmations: jasmine
        .createSpy("listPaymentConfirmations")
        .and.resolveTo([paymentNotifiedOrder]),
      confirmPayment: jasmine
        .createSpy("confirmPayment")
        .and.resolveTo({
          ...paymentNotifiedOrder,
          status: orderStatus_e.PrepareProduct,
          paymentConfirmedAt: fixedNow,
          paymentConfirmedBy: "admin",
        }),
    };
    return {
      service: new AdminOrderService(billGateway),
      billGateway,
    };
  }

  it("lists orders waiting for payment confirmation from Bill", async () => {
    const { service, billGateway } = createService();

    const result = await service.listPaymentConfirmations();

    expect(billGateway.listPaymentConfirmations).toHaveBeenCalled();
    expect(result[0]).toEqual({
      id: paymentNotifiedOrder.orderID,
      customerID: paymentNotifiedOrder.customerID,
      date: fixedNow,
      status: orderStatus_e.PaymentNotified,
      totalAmount: paymentNotifiedOrder.totalAmount,
      items: paymentNotifiedOrder.items,
    });
  });

  it("delegates payment confirmation to the central Bill order", async () => {
    const { service, billGateway } = createService();

    const result = await service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "admin",
    );

    expect(billGateway.confirmPayment).toHaveBeenCalledWith(
      paymentNotifiedOrder.orderID,
      "admin",
    );
    expect(result).toEqual({
      orderID: paymentNotifiedOrder.orderID,
      billOrderID: paymentNotifiedOrder.orderID,
      status: orderStatus_e.PrepareProduct,
      paymentConfirmedAt: fixedNow,
      paymentConfirmedBy: "admin",
    });
  });

  it("does not hide a Bill Service confirmation failure", async () => {
    const { service, billGateway } = createService();
    billGateway.confirmPayment.and.rejectWith(new Error("Invalid state"));

    await expectAsync(service.confirmPayment(
      paymentNotifiedOrder.orderID,
      "admin",
    )).toBeRejectedWithError("Invalid state");
  });
});
