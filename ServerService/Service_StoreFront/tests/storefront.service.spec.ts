import StorefrontService from "../src/services/storefront.service";
import { orderStatus_e, stockStatus_e } from "../src/utils/enum";

describe("StorefrontService", () => {
  const token = "customer-secret";
  const fixedNow = new Date("2026-07-25T03:00:00.000Z");

  function createService(
    accessExists = true,
    productImg = "product/P-001.jpg",
  ) {
    const access = {
      customerID: "CUST-001",
      customerName: "Customer One",
    };
    const product = {
      id: "P-001",
      name: "Product One",
      type: 0,
      img: productImg,
      description: "Description",
      status: stockStatus_e.normal,
      amount: 5,
      price: 100,
    };
    const accessRepo = {
      findActiveByToken: jasmine
        .createSpy("findActiveByToken")
        .and.resolveTo(accessExists ? access : null),
    };
    const productRepo = {
      listStorefrontProducts: jasmine
        .createSpy("listStorefrontProducts")
        .and.resolveTo([product]),
      findByIds: jasmine
        .createSpy("findByIds")
        .and.resolveTo([product]),
    };
    const discountRepo = {
      findByCustomerID: jasmine
        .createSpy("findByCustomerID")
        .and.resolveTo({
          customerID: "CUST-001",
          discounts: [
            { productID: "P-001", discountPercent: 10 },
          ],
        }),
    };
    const billGateway = {
      createOrder: jasmine.createSpy("createOrder").and.callFake((data) =>
        Promise.resolve({
          ...data,
          status: orderStatus_e.Submitted,
          source: "online",
          createdAt: fixedNow,
          updatedAt: fixedNow,
        })),
      listOnlineOrders: jasmine
        .createSpy("listOnlineOrders")
        .and.resolveTo([]),
      updateEvidence: jasmine.createSpy("updateEvidence"),
      cancelOrder: jasmine.createSpy("cancelOrder"),
      listPaymentConfirmations: jasmine
        .createSpy("listPaymentConfirmations")
        .and.resolveTo([]),
      confirmPayment: jasmine.createSpy("confirmPayment"),
    };
    const evidenceStorage = {
      uploadEvidence: jasmine
        .createSpy("uploadEvidence")
        .and.resolveTo({
          objectKey: "SO-001/new-evidence.webp",
          fileName: "proof.webp",
          mimeType: "image/webp",
        }),
      getEvidenceUrl: jasmine
        .createSpy("getEvidenceUrl")
        .and.callFake((key: string) =>
          Promise.resolve(`https://minio.example/${key}?signed=true`)),
      removeEvidence: jasmine
        .createSpy("removeEvidence")
        .and.resolveTo(undefined),
    };
    const service = new StorefrontService(
      accessRepo as any,
      productRepo as any,
      discountRepo as any,
      billGateway as any,
      evidenceStorage,
      "http://minio.example:9000/",
      () => fixedNow,
    );

    return {
      service,
      accessRepo,
      productRepo,
      discountRepo,
      billGateway,
      evidenceStorage,
    };
  }

  it("returns a session for an active customer link", async () => {
    const { service, accessRepo } = createService();

    const session = await service.getSession(token);

    expect(accessRepo.findActiveByToken).toHaveBeenCalledWith(token);
    expect(session).toEqual({
      customerID: "CUST-001",
      customerName: "Customer One",
      token,
    });
  });

  it("rejects an invalid or expired customer link", async () => {
    const { service } = createService(false);

    await expectAsync(service.getSession(token))
      .toBeRejectedWithError("Customer link is invalid");
  });

  it("maps customer discounts into storefront products", async () => {
    const { service, discountRepo } = createService();

    const products = await service.getProducts(token);

    expect(discountRepo.findByCustomerID)
      .toHaveBeenCalledWith("CUST-001");
    expect(products[0]).toEqual({
      id: "P-001",
      name: "Product One",
      img: "http://minio.example:9000/product/P-001.jpg",
      description: "Description",
      price: 100,
      amount: 5,
      percentDiscount: 10,
      priceAfterDiscount: 90,
      status: stockStatus_e.normal,
    });
  });

  it("rebases a legacy product image URL onto the configured MinIO host", async () => {
    const { service } = createService(
      true,
      "https://old-minio.example:9000/product/P-001.jpg",
    );

    const products = await service.getProducts(token);

    expect(products[0].img)
      .toBe("http://minio.example:9000/product/P-001.jpg");
  });

  it("creates an order using server-side product prices", async () => {
    const { service, discountRepo, billGateway } = createService();

    const created = await service.createOrder(token, {
      items: [{ productID: "P-001", quantity: 2 }],
      totalAmount: 1,
      priceAfterDiscount: 1,
    });

    expect(billGateway.createOrder).toHaveBeenCalledWith(jasmine.objectContaining({
      customerID: "CUST-001",
      totalAmount: 180,
      items: [
        jasmine.objectContaining({
          productID: "P-001",
          quantity: 2,
          priceOriginal: 100,
          discountPercent: 10,
          priceAfterDiscount: 90,
        }),
      ],
    }));
    expect(discountRepo.findByCustomerID)
      .toHaveBeenCalledWith("CUST-001");
    expect(created.totalAmount).toBe(180);
  });

  it("rejects an order quantity greater than available stock", async () => {
    const { service, billGateway } = createService();

    await expectAsync(service.createOrder(token, {
      items: [{ productID: "P-001", quantity: 6 }],
    })).toBeRejectedWithError(
      "Product P-001 has insufficient stock",
    );
    expect(billGateway.createOrder).not.toHaveBeenCalled();
  });

  it("uploads evidence and advances the order to PaymentNotified", async () => {
    const { service, billGateway, evidenceStorage } = createService();
    billGateway.listOnlineOrders.and.resolveTo([{
      orderID: "SO-001",
      customerID: "CUST-001",
      status: orderStatus_e.Submitted,
      totalAmount: 90,
      items: [],
      createdAt: fixedNow,
      updatedAt: fixedNow,
      source: "online",
    }]);
    billGateway.updateEvidence.and.callFake(
      (_customerID: string, orderID: string, evidence: any) =>
        Promise.resolve({
          orderID,
          customerID: "CUST-001",
          status: orderStatus_e.PaymentNotified,
          totalAmount: 90,
          items: [],
          confirmationEvidence: evidence,
          createdAt: fixedNow,
          updatedAt: fixedNow,
          source: "online",
        }),
    );

    const updated = await service.updateEvidence(token, "SO-001", {
      fileName: "proof.png",
      mimeType: "image/png",
      dataUrl: "data:image/png;base64,YQ==",
    });

    expect(updated.status).toBe(orderStatus_e.PaymentNotified);
    expect(updated.confirmationEvidence?.dataUrl).toBe(
      "https://minio.example/SO-001/new-evidence.webp?signed=true",
    );
    expect(evidenceStorage.uploadEvidence).toHaveBeenCalledWith(
      jasmine.any(Uint8Array),
      "SO-001",
      "proof.png",
      "image/png",
    );
    expect(billGateway.updateEvidence).toHaveBeenCalledWith(
      "CUST-001",
      "SO-001",
      jasmine.objectContaining({
        fileName: "proof.webp",
        mimeType: "image/webp",
        objectKey: "SO-001/new-evidence.webp",
        updatedAt: fixedNow,
      }),
    );
  });

  it("removes the previous private evidence after replacement", async () => {
    const { service, billGateway, evidenceStorage } = createService();
    billGateway.listOnlineOrders.and.resolveTo([{
      orderID: "SO-001",
      customerID: "CUST-001",
      status: orderStatus_e.PaymentNotified,
      totalAmount: 90,
      items: [],
      confirmationEvidence: {
        fileName: "old.png",
        mimeType: "image/png",
        objectKey: "SO-001/old-evidence.png",
        updatedAt: fixedNow,
      },
      createdAt: fixedNow,
      updatedAt: fixedNow,
      source: "online",
    }]);
    billGateway.updateEvidence.and.callFake(
      (_customerID: string, orderID: string, evidence: any) =>
        Promise.resolve({
          orderID,
          customerID: "CUST-001",
          status: orderStatus_e.PaymentNotified,
          totalAmount: 90,
          items: [],
          confirmationEvidence: evidence,
          createdAt: fixedNow,
          updatedAt: fixedNow,
          source: "online",
        }),
    );

    await service.updateEvidence(token, "SO-001", {
      fileName: "new.png",
      mimeType: "image/png",
      dataUrl: "data:image/png;base64,YQ==",
    });

    expect(evidenceStorage.removeEvidence)
      .toHaveBeenCalledWith("SO-001/old-evidence.png");
  });
});
