import BillRepo from "../src/repositories/bill.repo";

describe("BillRepo customer history", () => {
  it("matches the exact customer across sources and sorts newest first", async () => {
    const limit = jasmine.createSpy("limit").and.resolveTo([]);
    const sort = jasmine.createSpy("sort").and.returnValue({ limit });
    const find = jasmine.createSpy("find").and.returnValue({ sort });
    const repo = new BillRepo({ find } as any);
    await repo.findHistoryByCustomer("CUST-001", 20);
    expect(find).toHaveBeenCalledWith({ customerID: "CUST-001" });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1, orderID: -1 });
    expect(limit).toHaveBeenCalledWith(21);
    const createdAt = new Date("2026-09-26T00:00:00.000Z");
    await repo.findHistoryByCustomer("CUST-001", 20, { createdAt, orderID: "B" });
    expect(find).toHaveBeenCalledWith({ customerID: "CUST-001", $or: [
      { createdAt: { $lt: createdAt } },
      { createdAt, orderID: { $lt: "B" } },
    ] });
  });
});
