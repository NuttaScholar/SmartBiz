import BillRepo from "../repositories/bill.repo";
import { errorCode_e, OrderStatus, productType_e, stockStatus_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument, OrderItem } from "../models/order.interface";
import ContactRepo from "../repositories/contact.repo";
import { ContactDocument } from "../models/contact.interface";
import { orderInfo_t, productInfo_t } from "../type";
import ProductRepo from "../repositories/product.repo";
import { ProductDocument } from "../models/product.interface";

type OrderUpdateInput = Partial<Pick<OrderDocument, "customerID" | "items" | "totalAmount">>;

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
    ProductModel: Model<ProductDocument>
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
    return Promise.all(orders.map((order) => this.toOrderInfo(order)));
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
    await this.ensureProductsExist(data?.items);
    return this.repo.createOrder(data);
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
    if (data?.items) {
      await this.ensureProductsExist(data.items);
    }

    const updateData = this.pickOrderUpdate(data);
    return this.repo.updateOrder(orderID, updateData);
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

    await this.repo.deleteOrder(orderID);
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

    return this.repo.updateStatus(orderID, OrderStatus.Completed);
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

  private async toOrderInfo(order: OrderDocument): Promise<orderInfo_t> {
    const contact = await this.contactRepo.findByCodeName(order.customerID);

    return {
      id: order.orderID,
      customer: contact?.billName ?? order.customerID,
      date: order.createdAt,
      total: order.totalAmount,
      list: await Promise.all(order.items.map((item) => this.toProductInfo(item))),
      status: order.status
    };
  }

  private async toProductInfo(item: OrderItem): Promise<productInfo_t> {
    const quantity = Number(item.quantity);
    const priceAfterDiscount = Number(item.priceAfterDiscount);
    const product = await this.productRepo.findById(item.productID);

    const productInfo: productInfo_t = {
      id: item.productID,
      type: product?.type ?? productType_e.merchandise,
      name: product?.name ?? item.productID,
      img: product?.img ?? "",
      status: product?.status ?? stockStatus_e.normal,
      price: product?.price ?? item.priceOriginal,
      amount: quantity,
      total: this.roundMoney(quantity * priceAfterDiscount),
      percentDiscount: item.discountPercent,
      priceAfterDiscount
    };

    if (product?.condition !== undefined) productInfo.condition = product.condition;
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

  private async ensureProductsExist(items?: OrderItem[]) {
    if (!Array.isArray(items)) return;

    const productIDs = [...new Set(items.map((item) => item.productID))];
    const products = await Promise.all(productIDs.map((productID) => this.productRepo.findById(productID)));
    const missingProductID = productIDs.find((productID, index) => !products[index]);

    if (missingProductID) {
      throw {
        code: errorCode_e.NotFoundError,
        message: `Product not found: ${missingProductID}`
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
}
