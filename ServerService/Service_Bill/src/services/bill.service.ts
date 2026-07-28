import BillRepo from "../repositories/bill.repo";
import axios from "axios";
import { errorCode_e, OrderStatus, productType_e, stockStatus_e, transactionType_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument, OrderItem } from "../models/order.interface";
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
  ) {
    this.repo = new BillRepo(OrderModel);
    this.contactRepo = new ContactRepo(ContactModel);
    this.productRepo = new ProductRepo(ProductModel);
  }

  /**
   * ค้นหารายการคำสั่งซื้อจาก customerID / orderID / status
   */
  async searchOrders(customerID?: string, orderID?: string, status?: string): Promise<orderInfo_t[]> {
    const parsedStatus = this.parseOptionalStatus(status);
    const orders = await this.repo.findByCustomerAndOrder(customerID, orderID, parsedStatus);
    const products = await this.productRepo.findByIds(this.getProductIDs(orders));
    const productById = new Map(products.map((product) => [product.id, product]));

    return Promise.all(orders.map((order) => this.toOrderInfo(order, productById)));
  }

  async countOrdersByStatus(customerID?: string, orderID?: string): Promise<orderStatusCount_t[]> {
    return this.repo.countByStatus(customerID, orderID);
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
  async getOrdersByStatus(status: OrderStatus) {
    // ป้องกันค่าที่ไม่อยู่ใน enum
    if (!Object.values(OrderStatus).includes(status)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: `Invalid status: ${status}`
      };
    }

    return this.repo.findByStatus(status);
  }
  /**
   * สร้างคำสั่งซื้อใหม่
   */
  async createOrder(data: any) {
    await this.ensureCustomerExists(data?.customerID);
    this.validateStatus(data?.status);
    this.validateTotalAmount(data?.items, data?.totalAmount);
    const stockChanges = this.getStockChanges(data.items);

    await this.applyStockChanges(stockChanges);
    try {
      return await this.repo.createOrder(data);
    } catch (error) {
      await this.rollbackStockChanges(stockChanges);
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

    await this.applyStockChanges(stockChanges);
    try {
      return await this.repo.updateOrder(orderID, updateData);
    } catch (error) {
      await this.rollbackStockChanges(stockChanges);
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
    if (order.status >= OrderStatus.Billing) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Cannot delete order that is in Billing stage or later"
      };
    }

    const stockChanges = this.getStockChanges([], order.items);
    await this.applyStockChanges(stockChanges);
    try {
      const deletedOrder = await this.repo.deleteOrder(orderID);
      if (!deletedOrder) {
        throw {
          code: errorCode_e.NotFoundError,
          message: "Order not found"
        };
      }
    } catch (error) {
      await this.rollbackStockChanges(stockChanges);
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
      status: order.status
    };
  }

  private async toProductInfo(item: OrderItem, stockProduct?: ProductDocument): Promise<orderItemInfo_t> {
    const quantity = Number(item.quantity);
    const priceAfterDiscount = Number(item.priceAfterDiscount);
    const product = stockProduct ?? (await this.productRepo.findById(item.productID));

    const productInfo: orderItemInfo_t = {
      id: item.productID,
      type: product?.type ?? productType_e.merchandise,
      name: product?.name ?? item.productID,
      img: product?.img ?? "",
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

  private async applyStockChanges(changes: StockChange[]) {
    const appliedChanges: StockChange[] = [];

    try {
      for (const change of changes) {
        const applied = await this.applyStockChange(change);
        if (applied) {
          appliedChanges.push(change);
        }
      }
    } catch (error) {
      await this.rollbackStockChanges(appliedChanges);
      throw error;
    }
  }

  private async rollbackStockChanges(changes: StockChange[]) {
    for (const change of [...changes].reverse()) {
      await this.applyStockChange({
        productID: change.productID,
        quantity: -change.quantity
      });
    }
  }

  private async applyStockChange(change: StockChange) {
    const product = await this.productRepo.findById(change.productID);
    if (!product) {
      throw {
        code: errorCode_e.NotFoundError,
        message: `Product not found: ${change.productID}`
      };
    }

    if (product.type === productType_e.another) {
      return false;
    }

    if (product.amount === undefined) {
      throw {
        code: errorCode_e.NotFoundError,
        message: `Product stock amount not found: ${change.productID}`
      };
    }

    const currentAmount = Number(product.amount);
    const nextAmount = currentAmount - change.quantity;
    if (nextAmount < 0) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: `Insufficient stock for product ${change.productID}. Available: ${currentAmount}`
      };
    }

    await this.productRepo.updateById(change.productID, {
      amount: nextAmount,
      status: this.resolveStockStatus(nextAmount, Number(product.condition))
    });

    return true;
  }

  private resolveStockStatus(amount: number, condition: number) {
    if (amount === 0) return stockStatus_e.stockOut;
    if (amount < condition) return stockStatus_e.stockLow;
    return stockStatus_e.normal;
  }
}
