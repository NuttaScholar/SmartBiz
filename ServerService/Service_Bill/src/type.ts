
import { OrderStatus, productType_e, role_e, stockStatus_e } from "./utils/enum";

export type productInfo_t = {
  id: string;
  type: productType_e;
  name: string;
  img: string;
  condition?: number;
  status: stockStatus_e;
  price?: number;
  description?: string;
  amount?: number;
}

export type orderItemInfo_t = {
  id: string;
  type: productType_e;
  name: string;
  img: string;
  status: stockStatus_e;
  price: number;
  description?: string;
  amount: number;
  total: number;
  percentDiscount?: number;
  priceAfterDiscount?: number;
}

export type orderInfo_t = {
  id: string;
  customerID: string;
  customer: string;
  date: Date;
  total: number;
  list: orderItemInfo_t[];
  status: OrderStatus;
}

export type orderStatusCount_t = {
  status: OrderStatus;
  count: number;
}

export type tokenPackage_t = {
  username?: string;
  role?: role_e;
  type: "accessToken" | "refreshToken" | "serviceToken";
  service?: string;
  sub?: string;
  scopes?: string[];
}
