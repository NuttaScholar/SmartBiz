import { productInfo_t } from "../StockService/type";

export type orderInfo_t = {
    id: string;
    customer: string;
    date: Date;
    total: number;
    list: productInfo_t[];
}