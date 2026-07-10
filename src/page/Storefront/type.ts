import { billStatus_e, stockStatus_e } from '../../enum';

export type StorefrontProduct = {
  id: string;
  name: string;
  img: string;
  description: string;
  price: number;
  amount: number;
  percentDiscount: number;
  priceAfterDiscount: number;
  status: stockStatus_e;
};

export type CustomerSession = {
  customerID: string;
  customerName: string;
  token: string;
};

export type CartItem = {
  productID: string;
  quantity: number;
};

export type StorefrontOrder = {
  id: string;
  customerID: string;
  date: string;
  status: billStatus_e;
  totalAmount: number;
  items: Array<{
    productID: string;
    name: string;
    quantity: number;
    priceOriginal: number;
    discountPercent: number;
    priceAfterDiscount: number;
    img: string;
  }>;
};
