import BillRepo from "../repositories/bill.repo";
import { OrderStatus } from "../models/order.enum";
import { errorCode_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
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
}
