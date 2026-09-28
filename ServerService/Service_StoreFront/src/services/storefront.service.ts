import { parseEvidence } from "../utils/parse-evidence";
import type { StorefrontAccessDocument } from "../models/storefront-access.interface";
import type { ProductDocument } from "../models/product.interface";
import DiscountRepo from "../repositories/discount.repo";
import ProductRepo from "../repositories/product.repo";
import StorefrontAccessRepo from "../repositories/storefront-access.repo";
import type {
  BillGateway,
  BillOrderRecord,
} from "./bill-client.service";
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

export interface EvidenceStorage {
  uploadEvidence(
    data: Uint8Array,
    orderID: string,
    fileName: string,
    mimeType: string,
  ): Promise<{
    objectKey: string;
    fileName: string;
    mimeType: string;
  }>;
  getEvidenceUrl(objectKey: string): Promise<string>;
  removeEvidence(objectKey: string): Promise<void>;
}

export default class StorefrontService {
  constructor(
    private readonly accessRepo: StorefrontAccessRepo,
    private readonly productRepo: ProductRepo,
    private readonly discountRepo: DiscountRepo,
    private readonly billGateway: BillGateway,
    private readonly evidenceStorage: EvidenceStorage,
    private readonly productImageHost: string,
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

  async getOrders(token: string, limitInput?: unknown, cursor?: unknown) {
    const access = await this.authenticate(token);
    const limit = limitInput === undefined ? 20 : Number(limitInput);
    if ((limitInput !== undefined && typeof limitInput !== "string" && typeof limitInput !== "number")
      || !Number.isInteger(limit) || limit < 1 || limit > 100
      || (cursor !== undefined && (typeof cursor !== "string" || !cursor || cursor.length > 2048))) {
      throw new AppError("Invalid history limit or cursor", 400);
    }
    const page = await this.billGateway.listOrderHistory(access.customerID, limit, cursor as string | undefined);
    return { ...page, items: await Promise.all(page.items.map((order) => this.mapOrder(order))) };
  }

  async getOrder(token: string, orderID: string): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const order = await this.findOnlineOrder(
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
    const created = await this.billGateway.createOrder({
      orderID: this.generateOrderID(),
      customerID: access.customerID,
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
    const currentOrder = await this.findOnlineOrder(
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

    const parsedEvidence = parseEvidence(input);
    const uploadedEvidence = await this.evidenceStorage.uploadEvidence(
      parsedEvidence.data,
      normalizedOrderID,
      parsedEvidence.fileName,
      parsedEvidence.mimeType,
    );
    const evidence: StoredConfirmationEvidence = {
      fileName: uploadedEvidence.fileName,
      mimeType: uploadedEvidence.mimeType,
      objectKey: uploadedEvidence.objectKey,
      updatedAt: this.now(),
    };

    try {
      const updated = await this.billGateway.updateEvidence(
        access.customerID,
        normalizedOrderID,
        evidence,
      );
      const previousKey = currentOrder.confirmationEvidence?.objectKey;
      if (previousKey && previousKey !== uploadedEvidence.objectKey) {
        await this.removeEvidenceSafely(previousKey);
      }
      return this.mapOrder(updated);
    } catch (thrown) {
      await this.removeEvidenceSafely(uploadedEvidence.objectKey);
      throw thrown;
    }
  }

  async cancelOrder(
    token: string,
    orderID: string,
  ): Promise<StorefrontOrder> {
    const access = await this.authenticate(token);
    const updated = await this.billGateway.cancelOrder(
      access.customerID,
      this.requireText(orderID, "orderID"),
    );
    return this.mapOrder(updated);
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
      img: this.getProductImageUrl(product.img),
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

  private getProductImageUrl(img?: string): string {
    if (!img) return "";

    const storagePath = /^https?:\/\//i.test(img)
      ? new URL(img).pathname.replace(/^\/+/, "")
      : img.replace(/^\/+/, "");

    return `${this.productImageHost.replace(/\/$/, "")}/${storagePath}`;
  }

  private async mapOrder(order: BillOrderRecord): Promise<StorefrontOrder> {
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
      source: order.source ?? "direct",
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

  private async findOnlineOrder(
    customerID: string,
    orderID: string,
  ): Promise<BillOrderRecord | undefined> {
    const orders = await this.billGateway.listOnlineOrders(
      customerID,
      orderID,
    );
    return orders.find((order) => order.orderID === orderID);
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
