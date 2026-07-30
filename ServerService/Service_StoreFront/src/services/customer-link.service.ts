import ContactRepo from "../repositories/contact.repo";
import DiscountRepo from "../repositories/discount.repo";
import StorefrontAccessRepo from "../repositories/storefront-access.repo";
import type {
  CustomerLink,
  CustomerLinkSummary,
} from "../type";
import AppError from "../utils/app-error";
import { generateCustomerToken } from "../utils/customer-token";

export default class CustomerLinkService {
  constructor(
    private readonly contactRepo: ContactRepo,
    private readonly accessRepo: StorefrontAccessRepo,
    private readonly discountRepo: DiscountRepo,
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
    });
    return this.toCustomerLink(contact.codeName, contact.billName, token);
  }

  async listCustomerLinks(): Promise<CustomerLinkSummary[]> {
    const accesses = await this.accessRepo.listCustomerLinks();
    const customerDiscounts = await this.discountRepo.findByCustomerIDs(
      accesses.map((access) => access.customerID),
    );
    const discountsByCustomerID = new Map(
      customerDiscounts.map((discount) => [
        discount.customerID,
        discount.discounts,
      ]),
    );

    return accesses.map((access) => ({
      customerID: access.customerID,
      customerName: access.customerName,
      isActive: access.isActive,
      productDiscounts: discountsByCustomerID.get(access.customerID) ?? [],
    }));
  }

  async getCustomerLink(customerID: unknown): Promise<CustomerLink> {
    const normalizedCustomerID = this.requireCustomerID(customerID);
    const access = await this.accessRepo.findByCustomerIDWithToken(
      normalizedCustomerID,
    );
    if (!access) {
      throw new AppError("Customer link not found", 404);
    }

    return this.toCustomerLink(
      access.customerID,
      access.customerName,
      access.token,
    );
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
