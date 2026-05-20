import DiscountService from "../src/services/discount.service";
import { errorCode_e } from "../src/utils/enum";

describe("DiscountService", () => {
  function createService(contactExists = true) {
    const service = new DiscountService({} as any, {} as any) as any;
    service.contactRepo = {
      findByCodeName: jasmine
        .createSpy("findByCodeName")
        .and.resolveTo(contactExists ? { codeName: "CUST001" } : null),
    };
    service.repo = {
      getByCustomer: jasmine.createSpy("getByCustomer"),
      updateByCustomer: jasmine.createSpy("updateByCustomer").and.callFake((customerID, discounts) => Promise.resolve({ customerID, discounts })),
    };

    return service;
  }

  it("returns discounts when the customer and discount record exist", async () => {
    const service = createService();
    const discountRecord = {
      customerID: "CUST001",
      discounts: [{ productID: "PROD001", discountPercent: 10 }],
    };
    service.repo.getByCustomer.and.resolveTo(discountRecord);

    const result = await service.getDiscounts("CUST001");

    expect(service.contactRepo.findByCodeName).toHaveBeenCalledWith("CUST001");
    expect(result).toEqual(discountRecord);
  });

  it("rejects discount updates for unknown customers", async () => {
    const service = createService(false);

    try {
      await service.updateDiscounts("UNKNOWN", []);
      fail("Expected updateDiscounts to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.NotFoundError);
      expect(service.repo.updateByCustomer).not.toHaveBeenCalled();
    }
  });

  it("rejects discount updates when discounts is not an array", async () => {
    const service = createService();

    try {
      await service.updateDiscounts("CUST001", "invalid" as any);
      fail("Expected updateDiscounts to throw");
    } catch (err: any) {
      expect(err.code).toBe(errorCode_e.InvalidInputError);
      expect(service.repo.updateByCustomer).not.toHaveBeenCalled();
    }
  });

  it("updates discounts for an existing customer", async () => {
    const service = createService();
    const discounts = [{ productID: "PROD001", discountPercent: 15 }];

    const result = await service.updateDiscounts("CUST001", discounts);

    expect(service.repo.updateByCustomer).toHaveBeenCalledWith("CUST001", discounts);
    expect(result).toEqual({ customerID: "CUST001", discounts });
  });
});
