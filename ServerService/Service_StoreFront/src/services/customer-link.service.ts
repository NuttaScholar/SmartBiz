import ContactRepo from "../repositories/contact.repo";
import StorefrontAccessRepo from "../repositories/storefront-access.repo";
import type {
  CustomerDiscountSettings,
  CustomerLink,
  CustomerLinkSummary,
} from "../type";
import AppError from "../utils/app-error";
import { generateCustomerToken } from "../utils/customer-token";

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
    });
    return this.toCustomerLink(contact.codeName, contact.billName, token);
  }

  async listCustomerLinks(): Promise<CustomerLinkSummary[]> {
    const accesses = await this.accessRepo.listCustomerLinks();
    return accesses.map((access) => ({
      customerID: access.customerID,
      customerName: access.customerName,
      isActive: access.isActive,
      productDiscounts: access.productDiscounts.map((discount) => ({
        productID: discount.productID,
        discountPercent: discount.discountPercent,
      })),
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

  async getCustomerDiscounts(
    customerID: unknown,
  ): Promise<CustomerDiscountSettings> {
    const normalizedCustomerID = this.requireCustomerID(customerID);
    const access = await this.accessRepo.findByCustomerID(
      normalizedCustomerID,
    );
    if (!access) {
      throw new AppError("Customer link not found", 404);
    }

    return {
      customerID: access.customerID,
      discounts: access.productDiscounts.map((discount) => ({
        productID: discount.productID,
        discountPercent: discount.discountPercent,
      })),
    };
  }

  async updateCustomerDiscounts(
    customerID: unknown,
    input: unknown,
  ): Promise<CustomerDiscountSettings> {
    const normalizedCustomerID = this.requireCustomerID(customerID);
    const discounts = this.parseDiscounts(input);
    const updated = await this.accessRepo.updateDiscounts(
      normalizedCustomerID,
      discounts,
    );
    if (!updated) {
      throw new AppError("Customer link not found", 404);
    }

    return {
      customerID: updated.customerID,
      discounts: updated.productDiscounts.map((discount) => ({
        productID: discount.productID,
        discountPercent: discount.discountPercent,
      })),
    };
  }

  private requireCustomerID(customerID: unknown): string {
    if (typeof customerID !== "string" || !customerID.trim()) {
      throw new AppError("customerID is required", 400);
    }
    return customerID.trim();
  }

  private parseDiscounts(input: unknown): Array<{
    productID: string;
    discountPercent: number;
  }> {
    if (!Array.isArray(input)) {
      throw new AppError("discounts must be an array", 400);
    }

    const productIDs = new Set<string>();
    return input.map((rawDiscount) => {
      const discount = rawDiscount as {
        productID?: unknown;
        discountPercent?: unknown;
      };
      if (
        typeof discount.productID !== "string"
        || !discount.productID.trim()
      ) {
        throw new AppError("productID is required", 400);
      }

      const productID = discount.productID.trim();
      const discountPercent = Number(discount.discountPercent);
      if (
        !Number.isFinite(discountPercent)
        || discountPercent < 0
        || discountPercent > 100
      ) {
        throw new AppError(
          "discountPercent must be between 0 and 100",
          400,
        );
      }
      if (productIDs.has(productID)) {
        throw new AppError(`Duplicate product ${productID}`, 400);
      }
      productIDs.add(productID);

      return { productID, discountPercent };
    });
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
