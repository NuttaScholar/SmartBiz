import BillService from "../src/services/bill.service";
import { errorCode_e, OrderStatus, productType_e, stockStatus_e } from "../src/utils/enum";

describe("BillService", () => {
  function createService(contactExists = true) {
    const service = new BillService({} as any, {} as any, {} as any) as any;
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
    };
    service.productRepo = {
      findById: jasmine.createSpy("findById").and.resolveTo({
        id: "PROD001",
        type: productType_e.merchandise,
        name: "Product One",
        img: "https://example.com/product-one.jpg",
        status: stockStatus_e.normal,
        price: 500,
      }),
      findByIds: jasmine.createSpy("findByIds").and.resolveTo([
        {
          id: "PROD001",
          type: productType_e.merchandise,
          name: "Product One",
          img: "https://example.com/product-one.jpg",
          status: stockStatus_e.normal,
          price: 500,
        },
      ]),
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
    expect(service.repo.createOrder).toHaveBeenCalledWith(payload);
    expect(result).toEqual(payload);
  });

  it("searches orders with optional status", async () => {
    const service = createService();

    const result = await service.searchOrders("CUST001", "ORD001", String(OrderStatus.Billing));

    expect(service.repo.findByCustomerAndOrder).toHaveBeenCalledWith(
      "CUST001",
      "ORD001",
      OrderStatus.Billing
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
        customer: "Customer One",
        date: createdAt,
        total: 900,
        status: OrderStatus.Billing,
        list: [
          {
            id: "PROD001",
            type: productType_e.merchandise,
            name: "Product One",
            img: "https://example.com/product-one.jpg",
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
});
