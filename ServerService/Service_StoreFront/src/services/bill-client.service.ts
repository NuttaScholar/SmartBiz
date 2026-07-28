import axios, { AxiosError } from "axios";
import { BILL_REQUEST_TIMEOUT_MS, SERVICE_BILL_URL } from "../config";
import type { StorefrontOrderItem } from "../type";
import AppError from "../utils/app-error";
import { createServiceToken } from "../utils/service-token";

export interface CreateBillOrderInput {
  orderID: string;
  customerID: string;
  items: StorefrontOrderItem[];
  totalAmount: number;
}

export interface CreatedBillOrder {
  orderID: string;
}

interface BillApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BillSearchOrder {
  id: string;
  customerID: string;
  total: number;
  list: Array<{
    id: string;
    amount: number;
    priceAfterDiscount?: number;
  }>;
}

export interface BillGateway {
  createOrder(
    input: CreateBillOrderInput,
  ): Promise<CreatedBillOrder>;
}

export default class BillClientService implements BillGateway {
  private readonly baseUrl = SERVICE_BILL_URL.replace(/\/$/, "");

  async createOrder(
    input: CreateBillOrderInput,
  ): Promise<CreatedBillOrder> {
    const authorization = `Bearer ${createServiceToken(
      "service_bill",
      ["bill.order.create", "bill.order.read"],
    )}`;
    try {
      const response = await axios.post<BillApiResponse<{ orderID: string }>>(
        `${this.baseUrl}/bill`,
        {
          orderID: input.orderID,
          customerID: input.customerID,
          status: 0,
          items: input.items.map((item) => ({
            productID: item.productID,
            quantity: item.quantity,
            priceOriginal: item.priceOriginal,
            priceAfterDiscount: item.priceAfterDiscount,
            discountPercent: item.discountPercent,
          })),
          totalAmount: input.totalAmount,
        },
        {
          headers: { Authorization: authorization },
          timeout: BILL_REQUEST_TIMEOUT_MS,
        },
      );

      if (!response.data.success) {
        throw new AppError(
          response.data.message || "Bill Service rejected order",
          502,
        );
      }
      return { orderID: input.orderID };
    } catch (thrown) {
      const existing = await this.findMatchingOrder(input, authorization);
      if (existing) {
        return { orderID: existing.id };
      }
      throw this.toAppError(thrown);
    }
  }

  private async findMatchingOrder(
    input: CreateBillOrderInput,
    authorization: string,
  ): Promise<BillSearchOrder | undefined> {
    try {
      const response = await axios.get<BillApiResponse<BillSearchOrder[]>>(
        `${this.baseUrl}/bill/search`,
        {
          params: { orderID: input.orderID },
          headers: { Authorization: authorization },
          timeout: BILL_REQUEST_TIMEOUT_MS,
        },
      );
      const existing = response.data.data.find(
        (order) => order.id === input.orderID,
      );
      return existing && this.matches(existing, input)
        ? existing
        : undefined;
    } catch {
      return undefined;
    }
  }

  private matches(
    existing: BillSearchOrder,
    input: CreateBillOrderInput,
  ): boolean {
    if (
      existing.customerID !== input.customerID
      || this.roundMoney(existing.total) !== this.roundMoney(input.totalAmount)
      || existing.list.length !== input.items.length
    ) {
      return false;
    }

    const itemByID = new Map(
      input.items.map((item) => [item.productID, item]),
    );
    return existing.list.every((item) => {
      const expected = itemByID.get(item.id);
      return Boolean(
        expected
        && Number(item.amount) === expected.quantity
        && this.roundMoney(Number(item.priceAfterDiscount))
          === this.roundMoney(expected.priceAfterDiscount),
      );
    });
  }

  private toAppError(thrown: unknown): AppError {
    if (!(thrown instanceof AxiosError)) {
      return new AppError("Unable to create order in Bill Service", 502);
    }
    if (thrown.code === "ECONNABORTED") {
      return new AppError("Bill Service request timed out", 504);
    }

    const responseData = thrown.response?.data as
      | { message?: unknown }
      | undefined;
    const downstreamMessage = typeof responseData?.message === "string"
      ? responseData.message
      : undefined;
    const downstreamStatus = thrown.response?.status;
    const status = downstreamStatus
      && downstreamStatus >= 400
      && downstreamStatus < 500
      && downstreamStatus !== 401
      && downstreamStatus !== 403
      ? downstreamStatus
      : 502;

    return new AppError(
      downstreamMessage
        ? `Bill Service rejected order: ${downstreamMessage}`
        : "Unable to create order in Bill Service",
      status,
    );
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
