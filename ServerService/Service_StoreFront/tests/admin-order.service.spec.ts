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
    const evidenceStorage = {
      uploadEvidence: jasmine.createSpy("uploadEvidence"),
      getEvidenceUrl: jasmine
        .createSpy("getEvidenceUrl")
        .and.callFake((objectKey: string) => Promise.resolve(`https://evidence/${objectKey}`)),
      removeEvidence: jasmine.createSpy("removeEvidence"),
    };
    return {
      service: new AdminOrderService(billGateway, evidenceStorage),
      billGateway,
      evidenceStorage,
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

  it("gets an online order with a signed payment evidence URL", async () => {
    const { service, billGateway, evidenceStorage } = createService();
    billGateway.listOnlineOrders.and.resolveTo([{
      ...paymentNotifiedOrder,
      confirmationEvidence: {
        fileName: "payment.png",
        mimeType: "image/png",
        objectKey: "SO-001/payment.png",
        updatedAt: fixedNow,
      },
    }]);

    const result = await service.getOrder(
      paymentNotifiedOrder.orderID,
      paymentNotifiedOrder.customerID,
    );

    expect(billGateway.listOnlineOrders).toHaveBeenCalledWith(
      paymentNotifiedOrder.customerID,
      paymentNotifiedOrder.orderID,
    );
    expect(evidenceStorage.getEvidenceUrl).toHaveBeenCalledWith(
      "SO-001/payment.png",
    );
    expect(result.confirmationEvidence?.dataUrl).toBe(
      "https://evidence/SO-001/payment.png",
    );
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
