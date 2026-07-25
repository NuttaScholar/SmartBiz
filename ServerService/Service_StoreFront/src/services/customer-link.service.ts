import ContactRepo from "../repositories/contact.repo";
import StorefrontAccessRepo from "../repositories/storefront-access.repo";
import type { CustomerLink } from "../type";
import AppError from "../utils/app-error";
import {
  generateCustomerToken,
  hashCustomerToken,
} from "../utils/customer-token";

export default class CustomerLinkService {
  constructor(
    private readonly contactRepo: ContactRepo,
    private readonly accessRepo: StorefrontAccessRepo,
    private readonly createToken: () => string = generateCustomerToken,
  ) {}

  async createCustomerLink(customerID: unknown): Promise<CustomerLink> {
    const normalizedCustomerID = this.requireCustomerID(customerID);
    const contact = await this.contactRepo.findByCodeName(
      normalizedCustomerID,
    );
    if (!contact) {
      throw new AppError("Customer contact not found", 404);
    }

    const existing = await this.accessRepo.findByCustomerID(
      normalizedCustomerID,
    );
    if (existing) {
      throw new AppError(
        "Customer link already exists; rotate the token instead",
        409,
      );
    }

    const token = this.createToken();
    await this.accessRepo.create({
      customerID: contact.codeName,
      customerName: contact.billName,
      token,
      tokenHash: await hashCustomerToken(token),
    });
    return this.toCustomerLink(contact.codeName, contact.billName, token);
  }

  async rotateCustomerToken(customerID: unknown): Promise<CustomerLink> {
    const normalizedCustomerID = this.requireCustomerID(customerID);
    const contact = await this.contactRepo.findByCodeName(
      normalizedCustomerID,
    );
    if (!contact) {
      throw new AppError("Customer contact not found", 404);
    }

    const token = this.createToken();
    const updated = await this.accessRepo.rotateToken(
      contact.codeName,
      contact.billName,
      token,
      await hashCustomerToken(token),
    );
    if (!updated) {
      throw new AppError("Customer link not found", 404);
    }

    return this.toCustomerLink(contact.codeName, contact.billName, token);
  }

  private requireCustomerID(customerID: unknown): string {
    if (typeof customerID !== "string" || !customerID.trim()) {
      throw new AppError("customerID is required", 400);
    }
    return customerID.trim();
  }

  private toCustomerLink(
    customerID: string,
    customerName: string,
    token: string,
  ): CustomerLink {
    return {
      customerID,
      customerName,
      token,
      path: `/storefront/${token}`,
    };
  }
}
