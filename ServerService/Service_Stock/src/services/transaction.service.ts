import axios from "axios";
import { SERVICE_ACCOUNT_URL } from "../config";
import { errorCode_e, transactionType_e } from "../utils/enum";
import { responst_t, stockForm_t, TransitionForm_t } from "../type";
import ProductRepo from "../repositories/product.repo";
import { createServiceToken } from "../utils/service-token";

export default class TransactionService {
  constructor(private productRepo: ProductRepo) {}

  async postStockIn(list: stockForm_t[], bill: string, who?: string): Promise<responst_t<"none">> {
    try {
      let amount = 0;
      let description = "";

      for (const item of list) {
        const product = await this.productRepo.findById(item.productID);
        if (!product) continue;

        description += `${product.name} x${item.amount} |\r\n`;
        amount += item.price || 0;
      }

      const date = new Date();
      const data: TransitionForm_t = {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        topic: "Stock In",
        type: transactionType_e.expenses,
        money: amount,
        description,
        bill,
        who,
        readonly: true,
      };

      const serviceToken = createServiceToken(
        "service_account",
        ["account.transaction.create"],
      );
      const response = await axios.post(`${SERVICE_ACCOUNT_URL}/transaction`, data, {
        headers: { Authorization: `Bearer ${serviceToken}` },
      });

      return response.data;
    } catch (err) {
      console.error("postTransactionLog error:", err);
      return {
        success: false,
        errCode: errorCode_e.UnknownError,
        message: "Create transaction failed",
      };
    }
  }
}
