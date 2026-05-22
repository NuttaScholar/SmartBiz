import { billStatus_e } from "../../enum";
import { productInfo_t } from "../StockService/type";
import { errorCode_e } from "../../enum";

export type orderInfo_t = {
    id: string;
    customer: string;
    date: Date;
    total: number;
    list: productInfo_t[];
    status: billStatus_e;
}

export type orderInfoForm_t = {
    id?: string;
    customer?: string;
    date?: Date;
    list?: productInfo_t[];
}

export type orderItem_t = {
    productID: string;
    quantity: number;
    priceOriginal: number;
    priceAfterDiscount: number;
    discountPercent?: number;
}

export type order_t = {
    orderID: string;
    customerID: string;
    status: billStatus_e;
    items: orderItem_t[];
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type createOrderForm_t = {
    customerID: string;
    status: billStatus_e;
    items: orderItem_t[];
    totalAmount: number;
}

export type updateOrderForm_t = Partial<createOrderForm_t>;

export type searchOrderForm_t = {
    customerID?: string;
    orderID?: string;
    status?: billStatus_e;
}

export type discountItem_t = {
    productID: string;
    discountPercent: number;
}

export type discount_t = {
    customerID: string;
    discounts: discountItem_t[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type updateDiscountForm_t = {
    discounts: discountItem_t[];
}

export type deleted_t = {
    deleted: boolean;
}

export type responst_t<
  T extends
  | "getOrders"
  | "getOrderStatus"
  | "getDiscount"
  | "deleteOrder"
  | "none"
> = T extends "getOrders"
  ? {
    status: "success" | "error";
    result?: order_t[];
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getOrderStatus"
  ? {
    status: "success" | "error";
    result?: billStatus_e;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getDiscount"
  ? {
    status: "success" | "error";
    result?: discount_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "deleteOrder"
  ? {
    status: "success" | "error";
    result?: deleted_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : {
    status: "success" | "error";
    result?: order_t | discount_t;
    errCode?: errorCode_e;
    message?: string;
  }
