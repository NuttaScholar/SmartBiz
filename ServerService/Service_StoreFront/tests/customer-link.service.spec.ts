import CustomerLinkService from "../src/services/customer-link.service";

describe("CustomerLinkService", () => {
  const generatedToken = "a".repeat(64);

  function createService(contactExists = true, linkExists = false) {
    const contact = {
      codeName: "CUST-001",
      billName: "Customer One",
    };
    const contactRepo = {
      findByCodeName: jasmine
        .createSpy("findByCodeName")
        .and.resolveTo(contactExists ? contact : null),
    };
    const existingAccess = {
      customerID: "CUST-001",
      customerName: "Customer One",
      token: generatedToken,
      isActive: true,
    };
    const accessRepo = {
      findByCustomerID: jasmine
        .createSpy("findByCustomerID")
        .and.resolveTo(linkExists ? existingAccess : null),
      findByCustomerIDWithToken: jasmine
        .createSpy("findByCustomerIDWithToken")
        .and.resolveTo(linkExists ? existingAccess : null),
      listCustomerLinks: jasmine
        .createSpy("listCustomerLinks")
        .and.resolveTo(linkExists ? [existingAccess] : []),
      create: jasmine.createSpy("create").and.resolveTo({}),
      rotateToken: jasmine
        .createSpy("rotateToken")
        .and.resolveTo({ customerID: "CUST-001" }),
      disable: jasmine
        .createSpy("disable")
        .and.resolveTo(linkExists ? { ...existingAccess, isActive: false } : null),
      delete: jasmine
        .createSpy("delete")
        .and.resolveTo(linkExists ? existingAccess : null),
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
      findByCustomerIDs: jasmine
        .createSpy("findByCustomerIDs")
        .and.resolveTo([
          {
            customerID: "CUST-001",
            discounts: [
              { productID: "P-001", discountPercent: 10 },
            ],
          },
        ]),
    };
    const service = new CustomerLinkService(
      contactRepo as any,
      accessRepo as any,
      discountRepo as any,
      () => generatedToken,
    );
    return {
      service,
      contactRepo,
      accessRepo,
      discountRepo,
    };
  }

  it("creates a permanent customer link from an Account contact", async () => {
    const { service, contactRepo, accessRepo } = createService();

    const result = await service.createCustomerLink(" CUST-001 ");

    expect(contactRepo.findByCodeName).toHaveBeenCalledWith("CUST-001");
    expect(accessRepo.create).toHaveBeenCalledWith({
      customerID: "CUST-001",
      customerName: "Customer One",
      token: generatedToken,
    });
    expect(result).toEqual({
      customerID: "CUST-001",
      customerName: "Customer One",
      token: generatedToken,
      path: `/storefront/${generatedToken}`,
      isActive: true,
    });
  });

  it("rejects a customer ID that does not exist in Account", async () => {
    const { service, accessRepo } = createService(false);

    await expectAsync(service.createCustomerLink("UNKNOWN"))
      .toBeRejectedWithError("Customer contact not found");
    expect(accessRepo.create).not.toHaveBeenCalled();
  });

  it("returns an existing customer token to an admin", async () => {
    const { service, accessRepo } = createService(true, true);

    const result = await service.getCustomerLink(" CUST-001 ");

    expect(accessRepo.findByCustomerIDWithToken)
      .toHaveBeenCalledWith("CUST-001");
    expect(result).toEqual({
      customerID: "CUST-001",
      customerName: "Customer One",
      token: generatedToken,
      path: `/storefront/${generatedToken}`,
      isActive: true,
    });
  });

  it("lists customers that have storefront access", async () => {
    const { service } = createService(true, true);

    await expectAsync(service.listCustomerLinks()).toBeResolvedTo([
      {
        customerID: "CUST-001",
        customerName: "Customer One",
        isActive: true,
        productDiscounts: [
          { productID: "P-001", discountPercent: 10 },
        ],
      },
    ]);
  });

  it("rejects token lookup when the customer link does not exist", async () => {
    const { service } = createService();

    await expectAsync(service.getCustomerLink("CUST-001"))
      .toBeRejectedWithError("Customer link not found");
  });

  it("requires rotation when a customer link already exists", async () => {
    const { service, accessRepo } = createService(true, true);

    await expectAsync(service.createCustomerLink("CUST-001"))
      .toBeRejectedWithError(
        "Customer link already exists; rotate the token instead",
      );
    expect(accessRepo.create).not.toHaveBeenCalled();
  });

  it("rotates a token by customerID and replaces the previous token", async () => {
    const { service, accessRepo } = createService();

    const result = await service.rotateCustomerToken("CUST-001");

    expect(accessRepo.rotateToken).toHaveBeenCalledWith(
      "CUST-001",
      "Customer One",
      generatedToken,
    );
    expect(result.token).toBe(generatedToken);
  });

  it("disables an existing customer link", async () => {
    const { service, accessRepo } = createService(true, true);

    const result = await service.disableCustomerLink(" CUST-001 ");

    expect(accessRepo.disable).toHaveBeenCalledWith("CUST-001");
    expect(result.isActive).toBeFalse();
  });

  it("deletes an existing customer link", async () => {
    const { service, accessRepo } = createService(true, true);

    const result = await service.deleteCustomerLink(" CUST-001 ");

    expect(accessRepo.delete).toHaveBeenCalledWith("CUST-001");
    expect(result).toEqual({ customerID: "CUST-001" });
  });

  it("rejects deletion when the customer link does not exist", async () => {
    const { service } = createService();

    await expectAsync(service.deleteCustomerLink("CUST-001"))
      .toBeRejectedWithError("Customer link not found");
  });
});
