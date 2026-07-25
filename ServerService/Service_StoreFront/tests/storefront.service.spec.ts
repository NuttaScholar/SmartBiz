import StorefrontService from "../src/services/storefront.service";
import { orderStatus_e, stockStatus_e } from "../src/utils/enum";

describe("StorefrontService", () => {
  const token = "customer-secret";
  const fixedNow = new Date("2026-07-25T03:00:00.000Z");

  function createService(accessExists = true) {
    const access = {
      customerID: "CUST-001",
      customerName: "Customer One",
      productDiscounts: [
        { productID: "P-001", discountPercent: 10 },
      ],
    };
    const product = {
      id: "P-001",
      name: "Product One",
      type: 0,
      img: "https://example.com/product.jpg",
      description: "Description",
      status: stockStatus_e.normal,
      amount: 5,
      price: 100,
    };
    const accessRepo = {
      findActiveByTokenHash: jasmine
        .createSpy("findActiveByTokenHash")
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
    const orderRepo = {
      create: jasmine.createSpy("create").and.callFake((data) =>
        Promise.resolve({ ...data, createdAt: fixedNow })),
      listByCustomer: jasmine
        .createSpy("listByCustomer")
        .and.resolveTo([]),
      findByCustomerAndOrder: jasmine
        .createSpy("findByCustomerAndOrder"),
      updateEvidence: jasmine.createSpy("updateEvidence"),
      cancelSubmitted: jasmine.createSpy("cancelSubmitted"),
    };
    const service = new StorefrontService(
      accessRepo as any,
      productRepo as any,
      orderRepo as any,
      () => fixedNow,
    );

    return { service, accessRepo, productRepo, orderRepo };
  }

  it("returns a session for an active customer link", async () => {
    const { service, accessRepo } = createService();

    const session = await service.getSession(token);

    expect(accessRepo.findActiveByTokenHash).toHaveBeenCalledWith(
      jasmine.stringMatching(/^[a-f0-9]{64}$/),
    );
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
    const { service } = createService();

    const products = await service.getProducts(token);

    expect(products[0]).toEqual({
      id: "P-001",
      name: "Product One",
      img: "https://example.com/product.jpg",
      description: "Description",
      price: 100,
      amount: 5,
      percentDiscount: 10,
      priceAfterDiscount: 90,
      status: stockStatus_e.normal,
    });
  });

  it("creates an order using server-side product prices", async () => {
    const { service, orderRepo } = createService();

    const created = await service.createOrder(token, {
      items: [{ productID: "P-001", quantity: 2 }],
      totalAmount: 1,
      priceAfterDiscount: 1,
    });

    expect(orderRepo.create).toHaveBeenCalledWith(jasmine.objectContaining({
      customerID: "CUST-001",
      status: orderStatus_e.Submitted,
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
    expect(created.totalAmount).toBe(180);
  });

  it("rejects an order quantity greater than available stock", async () => {
    const { service, orderRepo } = createService();

    await expectAsync(service.createOrder(token, {
      items: [{ productID: "P-001", quantity: 6 }],
    })).toBeRejectedWithError(
      "Product P-001 has insufficient stock",
    );
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("uploads evidence and advances the order to PaymentNotified", async () => {
    const { service, orderRepo } = createService();
    orderRepo.updateEvidence.and.callFake(
      (_customerID: string, orderID: string, evidence: unknown) =>
        Promise.resolve({
          orderID,
          customerID: "CUST-001",
          status: orderStatus_e.PaymentNotified,
          totalAmount: 90,
          items: [],
          confirmationEvidence: evidence,
          createdAt: fixedNow,
        }),
    );

    const updated = await service.updateEvidence(token, "SO-001", {
      fileName: "proof.png",
      mimeType: "image/png",
      dataUrl: "data:image/png;base64,YQ==",
    });

    expect(updated.status).toBe(orderStatus_e.PaymentNotified);
    expect(orderRepo.updateEvidence).toHaveBeenCalledWith(
      "CUST-001",
      "SO-001",
      jasmine.objectContaining({
        fileName: "proof.png",
        mimeType: "image/png",
        updatedAt: fixedNow,
      }),
    );
  });
});
