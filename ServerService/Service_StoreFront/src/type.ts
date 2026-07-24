import { productType_e, stockStatus_e } from "./utils/enum";

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
}
