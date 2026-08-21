import BillRepo from "../repositories/bill.repo";
import axios from "axios";
import { errorCode_e, OrderSource, OrderStatus, productType_e, stockStatus_e, transactionType_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument, OrderItem, StoredConfirmationEvidence } from "../models/order.interface";
import ContactRepo from "../repositories/contact.repo";
import { ContactDocument } from "../models/contact.interface";
import { orderInfo_t, orderItemInfo_t, orderStatusCount_t, productInfo_t } from "../type";
import ProductRepo from "../repositories/product.repo";
import { ProductDocument } from "../models/product.interface";

type ServiceTokenFactory = (
  audience: string,
  scopes: string[],
) => string;

type OrderUpdateInput = Partial<Pick<OrderDocument, "customerID" | "items" | "totalAmount">>;
type StockChange = {
  productID: string;
  quantity: number;
};
type AccountApiResponse = {
  success: boolean;
  errCode?: errorCode_e;
  message?: string;
};
type StockApiResponse = AccountApiResponse;

const WORKFLOW = [
  OrderStatus.PrepareProduct,
  OrderStatus.PrepareShipment,
  OrderStatus.Billing,
  OrderStatus.WaitingPayment,
  OrderStatus.Completed
];

export default class BillService {
  private repo: BillRepo;
  private contactRepo: ContactRepo;
  private productRepo: ProductRepo;

  constructor(
    OrderModel: Model<OrderDocument>,
    ContactModel: Model<ContactDocument>,
    ProductModel: Model<ProductDocument>,
    private readonly serviceTokenFactory: ServiceTokenFactory = () => {
      throw new Error("Service token factory is not configured");
    },
    private readonly serviceAccountUrl = "http://localhost:3000",
    private readonly productImageHost = "http://localhost:9000",
    private readonly serviceStockUrl = "http://localhost:3003",
  ) {
    this.repo = new BillRepo(OrderModel);
    this.contactRepo = new ContactRepo(ContactModel);
    this.productRepo = new ProductRepo(ProductModel);
  }

  /**
   * ค้นหารายการคำสั่งซื้อจาก customerID / orderID / status
   */
  async searchOrders(customerID?: string, orderID?: string, status?: string, source?: string): Promise<orderInfo_t[]> {
    const parsedStatus = this.parseOptionalStatus(status);
    const parsedSource = this.parseOptionalSource(source);
    const orders = await this.repo.findByCustomerAndOrder(customerID, orderID, parsedStatus, parsedSource);
    const products = await this.productRepo.findByIds(this.getProductIDs(orders));
    const productById = new Map(products.map((product) => [product.id, product]));

    return Promise.all(orders.map((order) => this.toOrderInfo(order, productById)));
  }

  async countOrdersByStatus(customerID?: string, orderID?: string, source?: string): Promise<orderStatusCount_t[]> {
    return this.repo.countByStatus(customerID, orderID, this.parseOptionalSource(source));
  }

  async getProductUsage(productID?: string) {
    if (!productID) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "productID is required"
      };
    }

    const orderCount = await this.repo.countByProduct(productID);
    return {
      productID,
      isUsed: orderCount > 0,
      orderCount
    };
  }

  /**
   * ดึงรายการคำสั่งซื้อตามสถานะ (OrderStatus)
   */
  async getOrdersByStatus(status: OrderStatus, source?: string) {
    // ป้องกันค่าที่ไม่อยู่ใน enum
    if (!Object.values(OrderStatus).includes(status)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Invalid status: ${status}`
      };
    }

    return this.repo.findByStatus(status, this.parseOptionalSource(source));
  }
  /**
   * สร้างคำสั่งซื้อใหม่
   */
  async createOrder(data: any, source = OrderSource.Direct) {
    const normalizedData = {
      ...data,
      source,
      status: source === OrderSource.Online
        ? OrderStatus.Submitted
        : data?.status,
    };
    if (source === OrderSource.Online && normalizedData.orderID) {
      const existing = await this.repo.getOrder(normalizedData.orderID);
      if (existing) {
        if (
          existing.customerID === normalizedData.customerID
          && (existing.source ?? OrderSource.Direct) === OrderSource.Online
        ) {
          return existing;
        }
        throw {
          code: errorCode_e.AlreadyExistsError,
          message: "orderID already exists",
        };
      }
    }
    await this.ensureCustomerExists(normalizedData.customerID);
    this.validateStatus(normalizedData.status);
    this.validateTotalAmount(normalizedData.items, normalizedData.totalAmount);
    const stockChanges = this.getStockChanges(normalizedData.items);
    const order = this.repo.prepareOrder(normalizedData);

    await this.applyStockChanges(stockChanges, order.orderID, "Reserve stock for order creation");
    try {
      return await this.repo.saveOrder(order);
    } catch (error) {
      await this.rollbackStockChanges(stockChanges, order.orderID, "Rollback stock after order creation failed");
      throw error;
    }
  }
  /**
   * แก้ไขคำสั่งซื้อ
   */
  async updateOrder(orderID: string, data: any) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "Order not found"
      };
    }
    if ((order.source ?? OrderSource.Direct) !== OrderSource.Direct) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Online orders cannot be edited through the direct-order API",
      };
    }
    if (order.status >= OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Cannot update order that is in Billing stage or later"
      };
    }
    if (data?.customerID) {
      await this.ensureCustomerExists(data.customerID);
    }
    if (data?.items || data?.totalAmount !== undefined) {
      this.validateTotalAmount(data?.items ?? order.items, data?.totalAmount ?? order.totalAmount);
    }

    const updateData = this.pickOrderUpdate(data);
    const stockChanges = data?.items ? this.getStockChanges(data.items, order.items) : [];

    await this.applyStockChanges(stockChanges, orderID, "Adjust stock for order update");
    try {
      return await this.repo.updateOrder(orderID, updateData);
    } catch (error) {
      await this.rollbackStockChanges(stockChanges, orderID, "Rollback stock after order update failed");
      throw error;
    }
  }
  /**
    * ลบคำสั่งซื้อ
    */
  async deleteOrder(orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "Order not found"
      };
    }
    if ((order.source ?? OrderSource.Direct) === OrderSource.Online) {
      if (
        order.status !== OrderStatus.Submitted
        && order.status !== OrderStatus.PaymentNotified
      ) {
        throw {
          code: errorCode_e.InvalidStateError,
          message: "Only submitted or payment-notified orders can be cancelled",
        };
      }

      const stockChanges = this.getStockChanges([], order.items);
      await this.applyStockChanges(stockChanges, orderID, "Restore stock for admin order cancellation");
      try {
        const cancelledOrder = await this.repo.cancelOnlineByAdmin(orderID);
        if (!cancelledOrder) {
          throw {
            code: errorCode_e.InvalidStateError,
            message: "Order status changed before it could be cancelled",
          };
        }
      } catch (error) {
        await this.rollbackStockChanges(stockChanges, orderID, "Rollback stock after admin order cancellation failed");
        throw error;
      }

      return { deleted: true };
    }
    if (order.status >= OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Cannot delete order that is in Billing stage or later"
      };
    }

    const stockChanges = this.getStockChanges([], order.items);
    await this.applyStockChanges(stockChanges, orderID, "Restore stock for order deletion");
    try {
      const deletedOrder = await this.repo.deleteOrder(orderID);
      if (!deletedOrder) {
        throw {
          code: errorCode_e.NotFoundError,
          message: "Order not found"
        };
      }
    } catch (error) {
      await this.rollbackStockChanges(stockChanges, orderID, "Rollback stock after order deletion failed");
      throw error;
    }

    return { deleted: true };
  }
  /**
   * เลื่อนไปยังสถานะถัดไปตาม WORKFLOW
   * ถ้า status ปัจจุบันไม่อยู่ใน workflow หรืออยู่ขั้นสุดท้ายแล้ว → โยน error
   */
  async moveToNextStep(orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }

    const status = Number(order.status);
    if (isNaN(status)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Invalid status: ${order.status}`
      };
    }

    const source = order.source ?? OrderSource.Direct;
    if (source === OrderSource.Online) {
      if (status === OrderStatus.PrepareProduct) {
        return this.repo.updateStatus(orderID, OrderStatus.PrepareShipment);
      }
      if (status === OrderStatus.PrepareShipment) {
        return this.completeOrderWithIncome(order);
      }
      throw {
        code: errorCode_e.InvalidStateError,
        message: `Status ${status} cannot advance in online workflow`,
      };
    }

    const currentIndex = WORKFLOW.indexOf(status as OrderStatus);
    if (currentIndex === -1) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Status ${status} is not in workflow`
      };
    }

    if (currentIndex === WORKFLOW.length - 1) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Already at final step"
      };
    }

    if (currentIndex === OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Cannot auto-advance from Billing stage. Please choose 'Mark as Income' or 'Mark as Debt'."
      };
    }

    const nextStatus = WORKFLOW[currentIndex + 1];
    if (nextStatus === OrderStatus.Completed) {
      return this.completeOrderWithIncome(order);
    }

    return this.repo.updateStatus(orderID, nextStatus);
  }
  /**
   * เลือกเส้นทาง “จัดการบิล → รายรับ”
   * แนะนำให้อนุญาตเฉพาะเมื่ออยู่ในสถานะ Billing
   */
  async markAsIncome(orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }

    const status = Number(order.status);
    if (status !== OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Order is not in billing stage"
      };
    }

    return this.completeOrderWithIncome(order);
  }
  /**
   * เลือกเส้นทาง “จัดการบิล → ลูกหนี้”
   * แนะนำให้อนุญาตเฉพาะเมื่ออยู่ในสถานะ Billing
   */
  async markAsDebt(orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }

    const status = Number(order.status);
    if (status !== OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Order is not in billing stage"
      };
    }

    return this.repo.updateStatus(orderID, OrderStatus.WaitingPayment);
  }
  /**
   * ดึงสถานะปัจจุบันของคำสั่งซื้อ
   */
  async getStatus(orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }

    return order.status;
  }

  async getOnlineOrders(customerID: string, orderID?: string) {
    await this.ensureCustomerExists(customerID);
    return this.repo.findOnlineByCustomer(customerID, orderID);
  }

  async updateOnlineEvidence(
    customerID: string,
    orderID: string,
    evidence: StoredConfirmationEvidence,
  ) {
    this.requireText(customerID, "customerID");
    this.requireText(orderID, "orderID");
    if (
      !evidence
      || typeof evidence.fileName !== "string"
      || typeof evidence.mimeType !== "string"
      || typeof evidence.objectKey !== "string"
      || !evidence.updatedAt
    ) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Valid evidence is required",
      };
    }
    const updated = await this.repo.updateOnlineEvidence(
      customerID,
      orderID,
      evidence,
    );
    if (!updated) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Evidence can only be updated before payment confirmation",
      };
    }
    return updated;
  }

  async cancelOnlineOrder(customerID: string, orderID: string) {
    const order = await this.repo.getOrder(orderID);
    if (
      !order
      || order.customerID !== customerID
      || (order.source ?? OrderSource.Direct) !== OrderSource.Online
    ) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }
    if (order.status !== OrderStatus.Submitted) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Only a submitted order can be cancelled",
      };
    }

    const stockChanges = this.getStockChanges([], order.items);
    await this.applyStockChanges(stockChanges, orderID, "Restore stock for storefront order cancellation");
    const updated = await this.repo.cancelOnline(customerID, orderID);
    if (!updated) {
      await this.rollbackStockChanges(stockChanges, orderID, "Rollback stock after storefront order cancellation failed");
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Only a submitted order can be cancelled",
      };
    }
    return updated;
  }

  async listPaymentConfirmations() {
    return this.repo.findByStatus(
      OrderStatus.PaymentNotified,
      OrderSource.Online,
    );
  }

  async confirmOnlinePayment(orderID: string, confirmedBy: string) {
    this.requireText(orderID, "orderID");
    this.requireText(confirmedBy, "confirmedBy");
    const order = await this.repo.getOrder(orderID);
    if (!order) {
      throw { code: errorCode_e.NotFoundError, message: "Order not found" };
    }
    if (
      (order.source ?? OrderSource.Direct) !== OrderSource.Online
      || order.status !== OrderStatus.PaymentNotified
      || !order.confirmationEvidence
    ) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Only an online order with payment evidence can be confirmed",
      };
    }

    const updated = await this.repo.confirmOnlinePayment(
      orderID,
      confirmedBy.trim(),
      new Date(),
    );
    if (!updated) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Payment confirmation has already been processed",
      };
    }
    return updated;
  }

  private async completeOrderWithIncome(order: OrderDocument) {
    const previousStatus = order.status;
    const completedOrder = await this.repo.updateStatus(order.orderID, OrderStatus.Completed);
    if (!completedOrder) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "Order not found"
      };
    }

    try {
      await this.createIncomeTransaction(completedOrder);
      return completedOrder;
    } catch (error) {
      await this.repo.updateStatus(order.orderID, previousStatus);
      throw error;
    }
  }

  private async createIncomeTransaction(order: OrderDocument) {
    const merchandiseTotal = await this.getMerchandiseTotal(order.items);
    if (!merchandiseTotal.hasMerchandise) {
      return;
    }

    try {
      const serviceToken = this.serviceTokenFactory(
        "service_account",
        ["account.transaction.create"],
      );
      const response = await axios.post<AccountApiResponse>(
        `${this.serviceAccountUrl.replace(/\/$/, "")}/transaction`,
        {
          date: new Date().toISOString(),
          topic: `ยอดขาย`,
          type: transactionType_e.income,
          money: merchandiseTotal.total,
          who: order.customerID,
          description: `OrderID: ${order.orderID}`,
          bill: "",
          readonly: true
        },
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.data?.success) {
        throw {
          code: response.data?.errCode ?? errorCode_e.UnknownError,
          message: response.data?.message ?? "Create income transaction failed"
        };
      }
    } catch (error: any) {
      if (error.code) throw error;

      const accountError = error.response?.data;
      throw {
        code: accountError?.errCode ?? errorCode_e.UnknownError,
        message: "Create income transaction failed"
      };
    }
  }

  private async getMerchandiseTotal(items: OrderItem[]) {
    const productIDs = [...new Set(items.map((item) => item.productID))];
    const products = await this.productRepo.findByIds(productIDs);
    const productById = new Map(products.map((product) => [product.id, product]));
    let hasMerchandise = false;

    const total = this.roundMoney(
      items.reduce((sum, item) => {
        const product = productById.get(item.productID);
        if (!product) {
          throw {
            code: errorCode_e.NotFoundError,
            message: `Product not found: ${item.productID}`
          };
        }

        if (product.type !== productType_e.merchandise) {
          return sum;
        }

        hasMerchandise = true;
        return sum + Number(item.quantity) * Number(item.priceAfterDiscount);
      }, 0)
    );

    return { hasMerchandise, total };
  }

  private async ensureCustomerExists(customerID?: string) {
    if (!customerID) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "customerID is required"
      };
    }

    const contact = await this.contactRepo.findByCodeName(customerID);
    if (!contact) {
      throw {
        code: errorCode_e.NotFoundError,
        message: "Customer contact not found"
      };
    }
  }

  private async toOrderInfo(
    order: OrderDocument,
    productById?: Map<string, ProductDocument>
  ): Promise<orderInfo_t> {
    const contact = await this.contactRepo.findByCodeName(order.customerID);

    return {
      id: order.orderID,
      customerID: order.customerID,
      customer: contact?.billName ?? order.customerID,
      date: order.createdAt,
      total: order.totalAmount,
      list: await Promise.all(order.items.map((item) => this.toProductInfo(item, productById?.get(item.productID)))),
      status: order.status,
      source: order.source ?? OrderSource.Direct,
    };
  }

  private async toProductInfo(item: OrderItem, stockProduct?: ProductDocument): Promise<orderItemInfo_t> {
    const quantity = Number(item.quantity);
    const priceAfterDiscount = Number(item.priceAfterDiscount);
    const product = stockProduct ?? (await this.productRepo.findById(item.productID));

    const productInfo: orderItemInfo_t = {
      id: item.productID,
      type: product?.type ?? productType_e.merchandise,
      name: product?.name ?? item.name ?? item.productID,
      img: this.getProductImageUrl(product?.img ?? item.img),
      status: stockStatus_e.normal,
      price: item.priceOriginal,
      amount: quantity,
      total: this.roundMoney(quantity * priceAfterDiscount),
      percentDiscount: item.discountPercent,
      priceAfterDiscount
    };

    if (product?.description !== undefined) productInfo.description = product.description;

    return productInfo;
  }

  private getProductImageUrl(img?: string): string {
    if (!img) return "";

    const storagePath = /^https?:\/\//i.test(img)
      ? new URL(img).pathname.replace(/^\/+/, "")
      : img.replace(/^\/+/, "");

    return `${this.productImageHost.replace(/\/$/, "")}/${storagePath}`;
  }

  private pickOrderUpdate(data: any): OrderUpdateInput {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "Update payload must be an object"
      };
    }

    const allowedFields = new Set(["customerID", "items", "totalAmount"]);
    for (const field of Object.keys(data)) {
      if (!allowedFields.has(field)) {
        throw {
          code: errorCode_e.InvalidInputError,
          message: `Field '${field}' cannot be updated from this endpoint`
        };
      }
    }

    const updateData: OrderUpdateInput = {};
    if ("customerID" in data) updateData.customerID = data.customerID;
    if ("items" in data) updateData.items = data.items;
    if ("totalAmount" in data) updateData.totalAmount = data.totalAmount;

    return updateData;
  }

  private validateStatus(status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Invalid status: ${status}`
      };
    }
  }

  private parseOptionalStatus(status?: string) {
    if (status === undefined || status === "") {
      return undefined;
    }

    const parsedStatus = Number(status);
    this.validateStatus(parsedStatus);
    return parsedStatus;
  }

  private parseOptionalSource(source?: string): OrderSource | undefined {
    if (source === undefined || source === "") return undefined;
    if (!Object.values(OrderSource).includes(source as OrderSource)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Invalid source: ${source}`,
      };
    }
    return source as OrderSource;
  }

  private requireText(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `${fieldName} is required`,
      };
    }
    return value.trim();
  }

  private validateTotalAmount(items: OrderItem[], totalAmount: number) {
    if (!Array.isArray(items)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items is required"
      };
    }

    if (items.length === 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items must not be empty"
      };
    }

    if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "totalAmount is required"
      };
    }

    const calculatedTotal = this.roundMoney(
      items.reduce((sum, item) => {
        this.validateItem(item);
        const quantity = Number(item?.quantity);
        const priceAfterDiscount = Number(item?.priceAfterDiscount);

        return sum + quantity * priceAfterDiscount;
      }, 0)
    );

    const receivedTotal = this.roundMoney(totalAmount);
    if (calculatedTotal !== receivedTotal) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `totalAmount does not match calculated total (${calculatedTotal})`
      };
    }
  }

  private validateItem(item: OrderItem) {
    if (!item || typeof item !== "object") {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items must contain valid objects"
      };
    }

    if (typeof item.productID !== "string" || item.productID.trim() === "") {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items productID is required"
      };
    }

    this.validateNonNegativeNumber(item.priceOriginal, "items priceOriginal");
    this.validateNonNegativeNumber(item.priceAfterDiscount, "items priceAfterDiscount");

    if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items quantity must be greater than 0"
      };
    }

    if (
      item.discountPercent !== undefined &&
      (!Number.isFinite(Number(item.discountPercent)) ||
        Number(item.discountPercent) < 0 ||
        Number(item.discountPercent) > 100)
    ) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items discountPercent must be between 0 and 100"
      };
    }
  }

  private validateNonNegativeNumber(value: number, fieldName: string) {
    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `${fieldName} must be a non-negative number`
      };
    }
  }

  private roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getProductIDs(orders: OrderDocument[]) {
    return [...new Set(orders.flatMap((order) => order.items.map((item) => item.productID)))];
  }

  private getStockChanges(nextItems: OrderItem[], previousItems: OrderItem[] = []): StockChange[] {
    const previousQuantityByProduct = this.getQuantityByProduct(previousItems);
    const nextQuantityByProduct = this.getQuantityByProduct(nextItems);
    const productIDs = new Set([
      ...previousQuantityByProduct.keys(),
      ...nextQuantityByProduct.keys()
    ]);

    return [...productIDs]
      .map((productID) => ({
        productID,
        quantity: (nextQuantityByProduct.get(productID) || 0) - (previousQuantityByProduct.get(productID) || 0)
      }))
      .filter((change) => change.quantity !== 0);
  }

  private getQuantityByProduct(items: OrderItem[]) {
    return items.reduce((quantityByProduct, item) => {
      quantityByProduct.set(
        item.productID,
        (quantityByProduct.get(item.productID) || 0) + Number(item.quantity)
      );
      return quantityByProduct;
    }, new Map<string, number>());
  }

  private async applyStockChanges(changes: StockChange[], reference: string, note: string) {
    await this.requestStockAdjustment(
      changes.map((change) => ({
        productID: change.productID,
        delta: -change.quantity,
      })),
      reference,
      note,
    );
  }

  private async rollbackStockChanges(changes: StockChange[], reference: string, note: string) {
    await this.requestStockAdjustment(
      changes.map((change) => ({
        productID: change.productID,
        delta: change.quantity,
      })),
      reference,
      note,
    );
  }

  private async requestStockAdjustment(
    items: Array<{ productID: string; delta: number }>,
    reference: string,
    note: string,
  ) {
    if (items.length === 0) return;

    try {
      const serviceToken = this.serviceTokenFactory(
        "service_stock",
        ["stock.inventory.adjust"],
      );
      const response = await axios.post<StockApiResponse>(
        `${this.serviceStockUrl.replace(/\/$/, "")}/stock/adjust`,
        { reference, note, items },
        {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data?.success) {
        throw {
          code: response.data?.errCode ?? errorCode_e.UnknownError,
          message: response.data?.message ?? "Stock adjustment failed",
        };
      }
    } catch (error: any) {
      if (typeof error?.code === "number" && !error?.response) {
        throw error;
      }
      throw {
        code: error?.response?.data?.errCode ?? errorCode_e.UnknownError,
        message: error?.response?.data?.message ?? "Stock adjustment failed",
      };
    }
  }
}
