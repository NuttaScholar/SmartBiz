import BillService from "../src/services/bill.service";
import { errorCode_e, OrderSource, OrderStatus, productType_e, stockStatus_e } from "../src/utils/enum";

describe("BillService", () => {
  function createService(contactExists = true) {
    const service = new BillService(
      {} as any,
      {} as any,
      {} as any,
      undefined,
      undefined,
      "http://minio.example:9000/",
    ) as any;
    service.contactRepo = {
      findByCodeName: jasmine
        .createSpy("findByCodeName")
        .and.resolveTo(contactExists ? { codeName: "CUST001", billName: "Customer One" } : null),
    };
    service.repo = {
      createOrder: jasmine.createSpy("createOrder").and.callFake((data) => Promise.resolve(data)),
      findByCustomerAndOrder: jasmine.createSpy("findByCustomerAndOrder").and.resolveTo([]),
      getOrder: jasmine.createSpy("getOrder"),
      updateOrder: jasmine.createSpy("updateOrder").and.callFake((orderID, data) => Promise.resolve({ orderID, ...data })),
      updateStatus: jasmine.createSpy("updateStatus").and.callFake((orderID, status) => Promise.resolve({ orderID, status })),
      deleteOrder: jasmine.createSpy("deleteOrder").and.resolveTo({ orderID: "ORD001" }),
      findByStatus: jasmine.createSpy("findByStatus").and.resolveTo([]),
      findOnlineByCustomer: jasmine.createSpy("findOnlineByCustomer").and.resolveTo([]),
      updateOnlineEvidence: jasmine.createSpy("updateOnlineEvidence"),
      cancelOnline: jasmine.createSpy("cancelOnline"),
      confirmOnlinePayment: jasmine.createSpy("confirmOnlinePayment"),
    };
    service.productRepo = {
      findById: jasmine.createSpy("findById").and.resolveTo({
        id: "PROD001",
        type: productType_e.merchandise,
        name: "Product One",
        img: "product/PROD001.jpg",
        status: stockStatus_e.normal,
        amount: 10,
        price: 500,
      }),
      findByIds: jasmine.createSpy("findByIds").and.resolveTo([
        {
          id: "PROD001",
          type: productType_e.merchandise,
          name: "Product One",
          img: "product/PROD001.jpg",
          status: stockStatus_e.normal,
          amount: 10,
          price: 500,
        },
      ]),
      updateById: jasmine.createSpy("updateById").and.resolveTo(undefined),
    };

    return service;
  }

  it("creates an order when customerID exists in Contact", async () => {
    const service = createService();
    const payload = {
      customerID: "CUST001",
      status: OrderStatus.PrepareProduct,
      items: [
        {
          productID: "PROD001",
          quantity: 2,
          priceOriginal: 500,
          priceAfterDiscount: 450,
          discountPercent: 10,
        },
      ],
      totalAmount: 900,
    };

    const result = await service.createOrder(payload);

    expect(service.contactRepo.findByCodeName).toHaveBeenCalledWith("CUST001");
    expect(service.repo.createOrder).toHaveBeenCalledWith({
      ...payload,
      source: OrderSource.Direct,
    });
    expect(result).toEqual({ ...payload, source: OrderSource.Direct });
  });

  it("deducts stock when creating an order with an another product", async () => {
    const service = createService();
    service.productRepo.findById.and.resolveTo({
      id: "OTHER001",
      type: productType_e.another,
      name: "Other Product",
      status: stockStatus_e.normal,
      amount: 5,
      condition: 2,
      price: 100,
    });
    const payload = {
      customerID: "CUST001",
      status: OrderStatus.PrepareProduct,
      items: [
        {
          productID: "OTHER001",
          quantity: 3,
          priceOriginal: 100,
          priceAfterDiscount: 100,
        },
      ],
      totalAmount: 300,
    };

    await service.createOrder(payload);

    expect(service.productRepo.updateById).toHaveBeenCalledWith(
      "OTHER001",
      {
        amount: 2,
        status: stockStatus_e.normal,
      },
    );
  });

  it("rejects an another product order when stock is insufficient", async () => {
    const service = createService();
    service.productRepo.findById.and.resolveTo({
      id: "OTHER001",
      type: productType_e.another,
      name: "Other Product",
      status: stockStatus_e.normal,
      amount: 2,
      condition: 1,
      price: 100,
    });

    try {
      await service.createOrder({
        customerID: "CUST001",
        status: OrderStatus.PrepareProduct,
        items: [
          {
            productID: "OTHER001",
            quantity: 3,
            priceOriginal: 100,
            priceAfterDiscount: 100,
          },
        ],
        totalAmount: 300,
      });
      fail("Expected createOrder to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidStateError);
      expect(service.repo.createOrder).not.toHaveBeenCalled();
      expect(service.productRepo.updateById).not.toHaveBeenCalled();
    }
  });

  it("restores stock when deleting an order with an another product", async () => {
    const service = createService();
    service.repo.getOrder.and.resolveTo({
      orderID: "ORD001",
      status: OrderStatus.PrepareProduct,
      items: [
        {
          productID: "OTHER001",
          quantity: 2,
          priceOriginal: 100,
          priceAfterDiscount: 100,
        },
      ],
      totalAmount: 200,
    });
    service.productRepo.findById.and.resolveTo({
      id: "OTHER001",
      type: productType_e.another,
      name: "Other Product",
      status: stockStatus_e.normal,
      amount: 3,
      condition: 1,
      price: 100,
    });

    await service.deleteOrder("ORD001");

    expect(service.productRepo.updateById).toHaveBeenCalledWith(
      "OTHER001",
      {
        amount: 5,
        status: stockStatus_e.normal,
      },
    );
  });

  it("searches orders with optional status", async () => {
    const service = createService();

    const result = await service.searchOrders("CUST001", "ORD001", String(OrderStatus.Billing));

    expect(service.repo.findByCustomerAndOrder).toHaveBeenCalledWith(
      "CUST001",
      "ORD001",
      OrderStatus.Billing,
      undefined,
    );
    expect(result).toEqual([]);
  });

  it("adds stock product details to search order items", async () => {
    const service = createService();
    const createdAt = new Date("2026-05-23T10:00:00.000Z");
    service.repo.findByCustomerAndOrder.and.resolveTo([
      {
        orderID: "ORD001",
        customerID: "CUST001",
        status: OrderStatus.Billing,
        source: OrderSource.Direct,
        createdAt,
        totalAmount: 900,
        items: [
          {
            productID: "PROD001",
            quantity: 2,
            priceOriginal: 500,
            priceAfterDiscount: 450,
            discountPercent: 10,
          },
        ],
      },
    ]);

    const result = await service.searchOrders("CUST001", "ORD001", String(OrderStatus.Billing));

    expect(service.productRepo.findByIds).toHaveBeenCalledWith(["PROD001"]);
    expect(result).toEqual([
      {
        id: "ORD001",
        customerID: "CUST001",
        customer: "Customer One",
        date: createdAt,
        total: 900,
        status: OrderStatus.Billing,
        source: OrderSource.Direct,
        list: [
          {
            id: "PROD001",
            type: productType_e.merchandise,
            name: "Product One",
            img: "http://minio.example:9000/product/PROD001.jpg",
            status: stockStatus_e.normal,
            price: 500,
            amount: 2,
            total: 900,
            percentDiscount: 10,
            priceAfterDiscount: 450,
          },
        ],
      },
    ]);
  });

  it("rebases a legacy product image URL onto the configured MinIO host", async () => {
    const service = createService();
    service.productRepo.findByIds.and.resolveTo([
      {
        id: "PROD001",
        type: productType_e.merchandise,
        name: "Product One",
        img: "https://old-minio.example:9000/product/PROD001.jpg",
        status: stockStatus_e.normal,
        price: 500,
      },
    ]);
    service.repo.findByCustomerAndOrder.and.resolveTo([
      {
        orderID: "ORD001",
        customerID: "CUST001",
        status: OrderStatus.Billing,
        createdAt: new Date("2026-05-23T10:00:00.000Z"),
        totalAmount: 450,
        items: [
          {
            productID: "PROD001",
            quantity: 1,
            priceOriginal: 500,
            priceAfterDiscount: 450,
            discountPercent: 10,
          },
        ],
      },
    ]);

    const result = await service.searchOrders("CUST001", "ORD001");

    expect(result[0].list[0].img)
      .toBe("http://minio.example:9000/product/PROD001.jpg");
  });

  it("rejects search orders with invalid status", async () => {
    const service = createService();

    try {
      await service.searchOrders(undefined, undefined, "99");
      fail("Expected searchOrders to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidInputError);
      expect(service.repo.findByCustomerAndOrder).not.toHaveBeenCalled();
    }
  });

  it("rejects order creation when customerID does not exist", async () => {
    const service = createService(false);

    try {
      await service.createOrder({ customerID: "UNKNOWN" });
      fail("Expected createOrder to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.NotFoundError);
      expect(service.repo.createOrder).not.toHaveBeenCalled();
    }
  });

  it("rejects order creation when totalAmount does not match items total", async () => {
    const service = createService();

    try {
      await service.createOrder({
        customerID: "CUST001",
        status: OrderStatus.PrepareProduct,
        items: [
          {
            productID: "PROD001",
            quantity: 2,
            priceOriginal: 500,
            priceAfterDiscount: 450,
            discountPercent: 10,
          },
        ],
        totalAmount: 901,
      });
      fail("Expected createOrder to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidInputError);
      expect(service.repo.createOrder).not.toHaveBeenCalled();
    }
  });

  it("blocks updates after an order reaches billing", async () => {
    const service = createService();
    service.repo.getOrder.and.resolveTo({
      orderID: "ORD001",
      status: OrderStatus.Billing,
    });

    try {
      await service.updateOrder("ORD001", { totalAmount: 200 });
      fail("Expected updateOrder to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidStateError);
      expect(service.repo.updateOrder).not.toHaveBeenCalled();
    }
  });

  it("rejects protected fields in order updates", async () => {
    const service = createService();
    service.repo.getOrder.and.resolveTo({
      orderID: "ORD001",
      status: OrderStatus.PrepareProduct,
      items: [
        {
          productID: "PROD001",
          quantity: 1,
          priceOriginal: 100,
          priceAfterDiscount: 100,
        },
      ],
      totalAmount: 100,
    });

    try {
      await service.updateOrder("ORD001", { status: OrderStatus.Completed });
      fail("Expected updateOrder to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidInputError);
      expect(service.repo.updateOrder).not.toHaveBeenCalled();
    }
  });

  it("moves an order to the next workflow step", async () => {
    const service = createService();
    service.repo.getOrder.and.resolveTo({
      orderID: "ORD001",
      status: OrderStatus.PrepareProduct,
    });

    const result = await service.moveToNextStep("ORD001");

    expect(service.repo.updateStatus).toHaveBeenCalledWith("ORD001", OrderStatus.PrepareShipment);
    expect(result).toEqual({ orderID: "ORD001", status: OrderStatus.PrepareShipment });
  });

  it("creates an online order centrally in Submitted status", async () => {
    const service = createService();
    service.repo.getOrder.and.resolveTo(null);
    const payload = {
      orderID: "SO-001",
      customerID: "CUST001",
      items: [{
        productID: "PROD001",
        quantity: 1,
        priceOriginal: 500,
        priceAfterDiscount: 450,
      }],
      totalAmount: 450,
    };

    await service.createOrder(payload, OrderSource.Online);

    expect(service.repo.createOrder).toHaveBeenCalledWith({
      ...payload,
      source: OrderSource.Online,
      status: OrderStatus.Submitted,
    });
  });

  it("skips Billing after an online order is ready to ship", async () => {
    const service = createService();
    service.createIncomeTransaction = jasmine
      .createSpy("createIncomeTransaction")
      .and.resolveTo(undefined);
    service.repo.getOrder.and.resolveTo({
      orderID: "SO-001",
      customerID: "CUST001",
      source: OrderSource.Online,
      status: OrderStatus.PrepareShipment,
      items: [{
        productID: "PROD001",
        quantity: 1,
        priceOriginal: 500,
        priceAfterDiscount: 450,
      }],
    });

    await service.moveToNextStep("SO-001");

    expect(service.repo.updateStatus).toHaveBeenCalledWith(
      "SO-001",
      OrderStatus.Completed,
    );
  });
});
