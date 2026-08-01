import axios, { AxiosError } from "axios";
import { BILL_REQUEST_TIMEOUT_MS, SERVICE_BILL_URL } from "../config";
import type {
  StoredConfirmationEvidence,
  StorefrontOrderItem,
} from "../type";
import AppError from "../utils/app-error";
import { orderStatus_e } from "../utils/enum";
import { createServiceToken } from "../utils/service-token";

export interface CreateBillOrderInput {
  orderID: string;
  customerID: string;
  items: StorefrontOrderItem[];
  totalAmount: number;
}

export interface BillOrderRecord extends CreateBillOrderInput {
  status: orderStatus_e;
  source: "online";
  createdAt: Date;
  updatedAt: Date;
  confirmationEvidence?: StoredConfirmationEvidence;
  paymentConfirmedAt?: Date;
  paymentConfirmedBy?: string;
}

interface BillApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BillGateway {
  createOrder(input: CreateBillOrderInput): Promise<BillOrderRecord>;
  listOnlineOrders(
    customerID: string,
    orderID?: string,
  ): Promise<BillOrderRecord[]>;
  updateEvidence(
    customerID: string,
    orderID: string,
    evidence: StoredConfirmationEvidence,
  ): Promise<BillOrderRecord>;
  cancelOrder(
    customerID: string,
    orderID: string,
  ): Promise<BillOrderRecord>;
  listPaymentConfirmations(): Promise<BillOrderRecord[]>;
  confirmPayment(
    orderID: string,
    confirmedBy: string,
  ): Promise<BillOrderRecord>;
}

export default class BillClientService implements BillGateway {
  private readonly baseUrl = SERVICE_BILL_URL.replace(/\/$/, "");

  createOrder(input: CreateBillOrderInput): Promise<BillOrderRecord> {
    return this.call(
      "create online order",
      ["bill.storefront.manage"],
      (authorization) => axios.post(
        `${this.baseUrl}/bill/storefront`,
        input,
        this.config(authorization),
      ),
    );
  }

  listOnlineOrders(
    customerID: string,
    orderID?: string,
  ): Promise<BillOrderRecord[]> {
    return this.call(
      "read online orders",
      ["bill.storefront.read"],
      (authorization) => axios.get(
        `${this.baseUrl}/bill/storefront`,
        {
          ...this.config(authorization),
          params: { customerID, orderID },
        },
      ),
    );
  }

  updateEvidence(
    customerID: string,
    orderID: string,
    evidence: StoredConfirmationEvidence,
  ): Promise<BillOrderRecord> {
    return this.call(
      "update online order evidence",
      ["bill.storefront.manage"],
      (authorization) => axios.patch(
        `${this.baseUrl}/bill/storefront/${encodeURIComponent(orderID)}/evidence`,
        { customerID, evidence },
        this.config(authorization),
      ),
    );
  }

  cancelOrder(
    customerID: string,
    orderID: string,
  ): Promise<BillOrderRecord> {
    return this.call(
      "cancel online order",
      ["bill.storefront.manage"],
      (authorization) => axios.delete(
        `${this.baseUrl}/bill/storefront/${encodeURIComponent(orderID)}`,
        {
          ...this.config(authorization),
          params: { customerID },
        },
      ),
    );
  }

  listPaymentConfirmations(): Promise<BillOrderRecord[]> {
    return this.call(
      "list payment confirmations",
      ["bill.storefront.read"],
      (authorization) => axios.get(
        `${this.baseUrl}/bill/storefront/payment-confirmations`,
        this.config(authorization),
      ),
    );
  }

  confirmPayment(
    orderID: string,
    confirmedBy: string,
  ): Promise<BillOrderRecord> {
    return this.call(
      "confirm online payment",
      ["bill.storefront.manage"],
      (authorization) => axios.patch(
        `${this.baseUrl}/bill/storefront/${encodeURIComponent(orderID)}/payment-confirmation`,
        { confirmedBy },
        this.config(authorization),
      ),
    );
  }

  private async call<T>(
    action: string,
    scopes: string[],
    operation: (
      authorization: string,
    ) => Promise<{ data: BillApiResponse<T> }>,
  ): Promise<T> {
    const authorization = `Bearer ${createServiceToken(
      "service_bill",
      scopes,
    )}`;
    try {
      const response = await operation(authorization);
      if (!response.data.success || response.data.data === undefined) {
        throw new AppError(
          response.data.message || `Bill Service rejected ${action}`,
          502,
        );
      }
      return response.data.data;
    } catch (thrown) {
      throw this.toAppError(thrown, action);
    }
  }

  private config(authorization: string) {
    return {
      headers: { Authorization: authorization },
      timeout: BILL_REQUEST_TIMEOUT_MS,
    };
  }

  private toAppError(thrown: unknown, action: string): AppError {
    if (!(thrown instanceof AxiosError)) {
      return thrown instanceof AppError
        ? thrown
        : new AppError(`Unable to ${action} in Bill Service`, 502);
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
        ? `Bill Service rejected ${action}: ${downstreamMessage}`
        : `Unable to ${action} in Bill Service`,
      status,
    );
  }
}
