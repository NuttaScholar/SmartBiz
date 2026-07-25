import type { Document } from "mongoose";
import type {
  ConfirmationEvidence,
  StorefrontOrderItem,
} from "../type";
import type { orderStatus_e } from "../utils/enum";

export interface StorefrontOrderDocument extends Document {
  orderID: string;
  customerID: string;
  status: orderStatus_e;
  items: StorefrontOrderItem[];
  totalAmount: number;
  confirmationEvidence?: ConfirmationEvidence;
  createdAt: Date;
  updatedAt: Date;
}
