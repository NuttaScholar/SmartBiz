import type { Model } from "mongoose";
import type { StorefrontOrderDocument } from "../models/storefront-order.interface";
import type {
  ConfirmationEvidence,
  StorefrontOrderItem,
} from "../type";
import { orderStatus_e } from "../utils/enum";

export interface NewStorefrontOrder {
  orderID: string;
  customerID: string;
  status: orderStatus_e;
  items: StorefrontOrderItem[];
  totalAmount: number;
}

export default class StorefrontOrderRepo {
  constructor(
    private readonly model: Model<StorefrontOrderDocument>,
  ) {}

  create(data: NewStorefrontOrder) {
    return this.model.create(data);
  }

  listByCustomer(customerID: string) {
    return this.model.find({ customerID }).sort({ createdAt: -1 });
  }

  findByCustomerAndOrder(customerID: string, orderID: string) {
    return this.model.findOne({ customerID, orderID });
  }

  updateEvidence(
    customerID: string,
    orderID: string,
    evidence: ConfirmationEvidence,
  ) {
    return this.model.findOneAndUpdate(
      {
        customerID,
        orderID,
        status: {
          $in: [
            orderStatus_e.Submitted,
            orderStatus_e.PaymentNotified,
          ],
        },
      },
      {
        $set: {
          confirmationEvidence: evidence,
          status: orderStatus_e.PaymentNotified,
        },
      },
      { new: true, runValidators: true },
    );
  }

  cancelSubmitted(customerID: string, orderID: string) {
    return this.model.findOneAndUpdate(
      { customerID, orderID, status: orderStatus_e.Submitted },
      { $set: { status: orderStatus_e.Cancelled } },
      { new: true, runValidators: true },
    );
  }
}
