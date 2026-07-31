import {
  orderStatus_e,
  productType_e,
  role_e,
  stockStatus_e,
} from "./utils/enum";

export type productInfo_t = {
  id: string;
  type: productType_e;
  name: string;
  condition: number;
  img?: string;
  status?: stockStatus_e;
  price?: number;
  description?: string;
  amount?: number;
};

export interface StorefrontProduct {
  id: string;
  name: string;
  img: string;
  description: string;
  price: number;
  amount: number;
  percentDiscount: number;
  priceAfterDiscount: number;
  status: stockStatus_e;
}

export interface CustomerSession {
  customerID: string;
  customerName: string;
  token: string;
}

export interface CreateOrderItem {
  productID: string;
  quantity: number;
}

export interface StorefrontOrderItem {
  productID: string;
  name: string;
  quantity: number;
  priceOriginal: number;
  discountPercent: number;
  priceAfterDiscount: number;
  img: string;
}

export interface ConfirmationEvidence {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  updatedAt: Date;
}

export interface StoredConfirmationEvidence {
  fileName: string;
  mimeType: string;
  objectKey: string;
  updatedAt: Date;
}

export interface StorefrontOrder {
  id: string;
  customerID: string;
  date: Date;
  status: orderStatus_e;
  totalAmount: number;
  confirmationEvidence?: ConfirmationEvidence;
  items: StorefrontOrderItem[];
}

export interface PaymentConfirmationResult {
  orderID: string;
  billOrderID: string;
  status: orderStatus_e.PaymentConfirmed;
  paymentConfirmedAt?: Date;
  paymentConfirmedBy?: string;
}

export interface tokenPackage_t {
  username?: string;
  role?: role_e;
  type: "accessToken" | "refreshToken" | "serviceToken";
  service?: string;
  sub?: string;
  scopes?: string[];
}

export interface CustomerLink {
  customerID: string;
  customerName: string;
  token: string;
  path: string;
  isActive: boolean;
}

export interface DiscountItem {
  productID: string;
  discountPercent: number;
}

export interface CustomerLinkSummary {
  customerID: string;
  customerName: string;
  isActive: boolean;
  productDiscounts: DiscountItem[];
}
