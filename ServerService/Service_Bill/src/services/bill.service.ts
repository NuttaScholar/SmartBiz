import BillRepo from "../repositories/bill.repo";
import { OrderStatus } from "../models/order.enum";
import { errorCode_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument, OrderItem } from "../models/order.interface";
import ContactRepo from "../repositories/contact.repo";
import { ContactDocument } from "../models/contact.interface";

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

  constructor(OrderModel: Model<OrderDocument>, ContactModel: Model<ContactDocument>) {
    this.repo = new BillRepo(OrderModel);
    this.contactRepo = new ContactRepo(ContactModel);
  }

  /**
   * ค้นหารายการคำสั่งซื้อจาก customerID / orderID
   */
  searchOrders(customerID?: string, orderID?: string) {
    return this.repo.findByCustomerAndOrder(customerID, orderID);
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
    this.validateTotalAmount(data?.items, data?.totalAmount);
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

    return this.repo.updateOrder(orderID, data);
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

  private validateTotalAmount(items: OrderItem[], totalAmount: number) {
    if (!Array.isArray(items)) {
      throw {
        code: errorCode_e.InvalidInputError,
        message: "items is required"
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
        const quantity = Number(item?.quantity);
        const priceAfterDiscount = Number(item?.priceAfterDiscount);

        if (!Number.isFinite(quantity) || !Number.isFinite(priceAfterDiscount)) {
          throw {
            code: errorCode_e.InvalidInputError,
            message: "items quantity and priceAfterDiscount must be valid numbers"
          };
        }

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

  private roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
