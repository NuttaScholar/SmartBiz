import { Document } from "mongoose";
import { productInfo_t } from "../type";

export type ProductDocument = productInfo_t & Document;
