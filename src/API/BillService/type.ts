import { billStatus_e } from "../../enum";
import { productInfo_t } from "../StockService/type";

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