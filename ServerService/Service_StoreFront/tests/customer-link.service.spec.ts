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
    const accessRepo = {
      findByCustomerID: jasmine
        .createSpy("findByCustomerID")
        .and.resolveTo(linkExists ? { customerID: "CUST-001" } : null),
      findByCustomerIDWithToken: jasmine
        .createSpy("findByCustomerIDWithToken")
        .and.resolveTo(linkExists ? {
          customerID: "CUST-001",
          customerName: "Customer One",
          token: generatedToken,
        } : null),
      create: jasmine.createSpy("create").and.resolveTo({}),
      rotateToken: jasmine
        .createSpy("rotateToken")
        .and.resolveTo({ customerID: "CUST-001" }),
    };
    const service = new CustomerLinkService(
      contactRepo as any,
      accessRepo as any,
      () => generatedToken,
    );
    return { service, contactRepo, accessRepo };
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
    });
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
});
