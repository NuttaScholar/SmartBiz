import type { StorefrontAccessDocument } from "../models/storefront-access.interface";
import type { ProductDocument } from "../models/product.interface";
import DiscountRepo from "../repositories/discount.repo";
import ProductRepo from "../repositories/product.repo";
import StorefrontAccessRepo from "../repositories/storefront-access.repo";
import StorefrontOrderRepo from "../repositories/storefront-order.repo";
import type {
  ConfirmationEvidence,
  CreateOrderItem,
  CustomerSession,
  DiscountItem,
  StorefrontOrder,
  StorefrontOrderItem,
  StorefrontProduct,
  StoredConfirmationEvidence,
} from "../type";
import AppError from "../utils/app-error";
import { orderStatus_e, stockStatus_e } from "../utils/enum";

const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_EVIDENCE_TYPES = new Set([
  "application/pdf",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface EvidenceStorage {
  uploadEvidence(
    data: Uint8Array,
    orderID: string,
    fileName: string,
    mimeType: string,
  ): Promise<string>;
  getEvidenceUrl(objectKey: string): Promise<string>;
  removeEvidence(objectKey: string): Promise<void>;
}

interface ParsedEvidence {
  fileName: string;
  mimeType: string;
  data: Uint8Array;
}

export default class StorefrontService {
  constructor(
    private readonly accessRepo: StorefrontAccessRepo,
    private readonly productRepo: ProductRepo,
    private readonly discountRepo: DiscountRepo,
    private readonly orderRepo: StorefrontOrderRepo,
    private readonly evidenceStorage: EvidenceStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getSession(token: string): Promise<CustomerSession> {
    const access = await this.authenticate(token);
    return {
      customerID: access.customerID,
      customerName: access.customerName,
      token,
    };
  }

  async getProducts(
    token: string,
    query?: string,
  ): Promise<StorefrontProduct[]> {
    const access = await this.authenticate(token);
    const [products, customerDiscount] = await Promise.all([
      this.productRepo.listStorefrontProducts(query),
      this.discountRepo.findByCustomerID(access.customerID),
    ]);
    const discounts = customerDiscount?.discounts ?? [];

    return products.map((product) => this.mapProduct(product, discounts));
  }

  async getOrders(token: string): Promise<StorefrontOrder[]> {
    const access = await this.authenticate(token);
    const orders = await this.orderRepo.listByCustomer(access.customerID);
    return Promise.all(orders.map((order) => this.mapOrder(order)));
  }

  async getOrder(token: string, orderID: string): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const order = await this.orderRepo.findByCustomerAndOrder(
      access.customerID,
      this.requireText(orderID, "orderID"),
    );
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return this.mapOrder(order);
  }

  async createOrder(
    token: string,
    input: unknown,
  ): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const items = this.parseCreateItems(input);
    const productIDs = items.map((item) => item.productID);
    const [products, customerDiscount] = await Promise.all([
      this.productRepo.findByIds(productIDs),
      this.discountRepo.findByCustomerID(access.customerID),
    ]);
    const discounts = customerDiscount?.discounts ?? [];
    const productByID = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems: StorefrontOrderItem[] = items.map((item) => {
      const product = productByID.get(item.productID);
      if (!product) {
        throw new AppError(`Product ${item.productID} not found`, 404);
      }

      const available = Number(product.amount ?? 0);
      if (
        product.status === stockStatus_e.stockOut ||
        item.quantity > available
      ) {
        throw new AppError(
          `Product ${item.productID} has insufficient stock`,
          409,
        );
      }

      const storefrontProduct = this.mapProduct(product, discounts);
      return {
        productID: storefrontProduct.id,
        name: storefrontProduct.name,
        quantity: item.quantity,
        priceOriginal: storefrontProduct.price,
        discountPercent: storefrontProduct.percentDiscount,
        priceAfterDiscount: storefrontProduct.priceAfterDiscount,
        img: storefrontProduct.img,
      };
    });

    const totalAmount = this.roundMoney(
      orderItems.reduce(
        (total, item) =>
          total + item.priceAfterDiscount * item.quantity,
        0,
      ),
    );
    const created = await this.orderRepo.create({
      orderID: this.generateOrderID(),
      customerID: access.customerID,
      status: orderStatus_e.Submitted,
      items: orderItems,
      totalAmount,
    });

    return this.mapOrder(created);
  }

  async updateEvidence(
    token: string,
    orderID: string,
    input: unknown,
  ): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const normalizedOrderID = this.requireText(orderID, "orderID");
    const currentOrder = await this.orderRepo.findByCustomerAndOrder(
      access.customerID,
      normalizedOrderID,
    );
    if (!currentOrder) {
      throw new AppError("Order not found", 404);
    }
    if (
      currentOrder.status !== orderStatus_e.Submitted &&
      currentOrder.status !== orderStatus_e.PaymentNotified
    ) {
      throw new AppError(
        "Evidence can only be updated before payment confirmation",
        409,
      );
    }

    const parsedEvidence = this.parseEvidence(input);
    const objectKey = await this.evidenceStorage.uploadEvidence(
      parsedEvidence.data,
      normalizedOrderID,
      parsedEvidence.fileName,
      parsedEvidence.mimeType,
    );
    const evidence: StoredConfirmationEvidence = {
      fileName: parsedEvidence.fileName,
      mimeType: parsedEvidence.mimeType,
      objectKey,
      updatedAt: this.now(),
    };

    try {
      const updated = await this.orderRepo.updateEvidence(
        access.customerID,
        normalizedOrderID,
        evidence,
      );
      if (!updated) {
        throw new AppError(
          "Evidence can only be updated before payment confirmation",
          409,
        );
      }

      const previousKey = currentOrder.confirmationEvidence?.objectKey;
      if (previousKey && previousKey !== objectKey) {
        await this.removeEvidenceSafely(previousKey);
      }
      return this.mapOrder(updated);
    } catch (thrown) {
      await this.removeEvidenceSafely(objectKey);
      throw thrown;
    }
  }

  async cancelOrder(
    token: string,
    orderID: string,
  ): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const updated = await this.orderRepo.cancelSubmitted(
      access.customerID,
      this.requireText(orderID, "orderID"),
    );
    if (updated) {
      return this.mapOrder(updated);
    }

    await this.assertOrderExists(access.customerID, orderID);
    throw new AppError("Only a submitted order can be cancelled", 409);
  }

  private async authenticate(
    token: string,
  ): Promise<StorefrontAccessDocument> {
    const normalizedToken = this.requireText(token, "customerToken");
    const access = await this.accessRepo.findActiveByToken(normalizedToken);
    if (!access) {
      throw new AppError("Customer link is invalid", 401);
    }
    return access;
  }

  private mapProduct(
    product: ProductDocument,
    discounts: DiscountItem[],
  ): StorefrontProduct {
    const price = this.roundMoney(Number(product.price ?? 0));
    const percentDiscount = discounts.find(
      (discount) => discount.productID === product.id,
    )?.discountPercent ?? 0;

    return {
      id: product.id,
      name: product.name,
      img: product.img ?? "",
      description: product.description ?? "",
      price,
      amount: Math.max(0, Number(product.amount ?? 0)),
      percentDiscount,
      priceAfterDiscount: this.roundMoney(
        price * (1 - percentDiscount / 100),
      ),
      status: product.status ?? stockStatus_e.stockOut,
    };
  }

  private async mapOrder(order: {
    orderID: string;
    customerID: string;
    createdAt: Date;
    status: orderStatus_e;
    totalAmount: number;
    confirmationEvidence?: StoredConfirmationEvidence;
    items: StorefrontOrderItem[];
  }): Promise<StorefrontOrder> {
    const storedEvidence = order.confirmationEvidence;
    const confirmationEvidence: ConfirmationEvidence | undefined =
      storedEvidence
        ? {
            fileName: storedEvidence.fileName,
            mimeType: storedEvidence.mimeType,
            dataUrl: await this.evidenceStorage.getEvidenceUrl(
              storedEvidence.objectKey,
            ),
            updatedAt: storedEvidence.updatedAt,
          }
        : undefined;

    return {
      id: order.orderID,
      customerID: order.customerID,
      date: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      confirmationEvidence,
      items: order.items,
    };
  }

  private parseCreateItems(input: unknown): CreateOrderItem[] {
    const value = input as { items?: unknown };
    if (!value || !Array.isArray(value.items) || value.items.length === 0) {
      throw new AppError("items must be a non-empty array", 400);
    }

    const seen = new Set<string>();
    return value.items.map((rawItem) => {
      const item = rawItem as Partial<CreateOrderItem>;
      const productID = this.requireText(item?.productID, "productID");
      if (
        !Number.isInteger(item?.quantity) ||
        Number(item.quantity) <= 0
      ) {
        throw new AppError("quantity must be a positive integer", 400);
      }
      if (seen.has(productID)) {
        throw new AppError(`Duplicate product ${productID}`, 400);
      }
      seen.add(productID);
      return { productID, quantity: Number(item.quantity) };
    });
  }

  private parseEvidence(input: unknown): ParsedEvidence {
    const value = input as Record<string, unknown>;
    const fileName = this.requireText(value?.fileName, "fileName");
    const mimeType = this.requireText(value?.mimeType, "mimeType")
      .toLowerCase();
    const dataUrl = this.requireText(value?.dataUrl, "dataUrl");

    if (!ACCEPTED_EVIDENCE_TYPES.has(mimeType)) {
      throw new AppError("Evidence must be an image or PDF", 400);
    }

    const match = /^data:([^;,]+);base64,([a-z0-9+/=\s]+)$/i.exec(dataUrl);
    if (!match || match[1].toLowerCase() !== mimeType) {
      throw new AppError("dataUrl does not match mimeType", 400);
    }
    let data: Uint8Array;
    try {
      const binary = globalThis.atob(match[2].replace(/\s/g, ""));
      data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    } catch {
      throw new AppError("Evidence dataUrl is not valid base64", 400);
    }
    if (data.byteLength === 0 || data.byteLength > MAX_EVIDENCE_BYTES) {
      throw new AppError("Evidence must not exceed 2 MB", 413);
    }

    return { fileName, mimeType, data };
  }

  private async assertOrderExists(
    customerID: string,
    orderID: string,
  ): Promise<void> {
    const order = await this.orderRepo.findByCustomerAndOrder(
      customerID,
      orderID,
    );
    if (!order) {
      throw new AppError("Order not found", 404);
    }
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new AppError(`${fieldName} is required`, 400);
    }
    return value.trim();
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private async removeEvidenceSafely(objectKey: string): Promise<void> {
    try {
      await this.evidenceStorage.removeEvidence(objectKey);
    } catch (error) {
      console.error(`Failed to remove evidence ${objectKey}`, error);
    }
  }

  private generateOrderID(): string {
    const date = this.now().toISOString().slice(2, 10).replace(/-/g, "");
    const randomValue = new Uint32Array(1);
    globalThis.crypto.getRandomValues(randomValue);
    const suffix = randomValue[0].toString(16).padStart(8, "0").toUpperCase();
    return `SO-${date}-${suffix}`;
  }
}
