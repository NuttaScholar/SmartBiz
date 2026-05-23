
import { OrderStatus, productType_e, role_e, stockStatus_e } from "./utils/enum";

export type productInfo_t = {
  id: string;
  name: string;
  img: string;
  price: number;
  amount: number;
  total: number;
  percentDiscount?: number;
  priceAfterDiscount?: number;
}

export type orderInfo_t = {
    orderID: string;
    customerID: string;
    date: Date;
    totalAmount: number;
    items: productInfo_t[];
    status: OrderStatus;
}

export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
