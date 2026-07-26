import { AxiosError } from "axios";
import { axios_storefront } from "../../lib/axios";
import type {
  CartItem,
  CustomerSession,
  StorefrontOrder,
  StorefrontOrderEvidence,
  StorefrontProduct,
} from "../../page/Storefront/type";

type StorefrontApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
};

export class StorefrontApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "StorefrontApiError";
  }
}

function pathSegment(value: string): string {
  return encodeURIComponent(value);
}

function unwrap<T>(response: StorefrontApiResponse<T>): T {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  throw new StorefrontApiError(
    response.message || "ไม่สามารถเชื่อมต่อบริการหน้าร้านได้",
    response.status,
  );
}

function toApiError(error: unknown): never {
  if (error instanceof StorefrontApiError) {
    throw error;
  }

  const axiosError = error as AxiosError<StorefrontApiResponse<unknown>>;
  const response = axiosError.response?.data;
  throw new StorefrontApiError(
    response?.message || axiosError.message || "ไม่สามารถเชื่อมต่อบริการหน้าร้านได้",
    response?.status || axiosError.response?.status,
  );
}

async function request<T>(
  operation: () => Promise<{ data: StorefrontApiResponse<T> }>,
): Promise<T> {
  try {
    return unwrap((await operation()).data);
  } catch (error) {
    return toApiError(error);
  }
}

export function getStorefrontErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "ไม่สามารถเชื่อมต่อบริการหน้าร้านได้";
}

export function getStorefrontSession(
  customerToken: string,
  signal?: AbortSignal,
): Promise<CustomerSession> {
  return request(() =>
    axios_storefront.get(
      `/storefront/${pathSegment(customerToken)}/session`,
      { signal },
    ),
  );
}

export function getStorefrontProducts(
  customerToken: string,
  signal?: AbortSignal,
): Promise<StorefrontProduct[]> {
  return request(() =>
    axios_storefront.get(
      `/storefront/${pathSegment(customerToken)}/products`,
      { signal },
    ),
  );
}

export function getStorefrontOrders(
  customerToken: string,
  signal?: AbortSignal,
): Promise<StorefrontOrder[]> {
  return request(() =>
    axios_storefront.get(
      `/storefront/${pathSegment(customerToken)}/orders`,
      { signal },
    ),
  );
}

export function createStorefrontOrder(
  customerToken: string,
  items: CartItem[],
): Promise<StorefrontOrder> {
  return request(() =>
    axios_storefront.post(
      `/storefront/${pathSegment(customerToken)}/orders`,
      { items },
    ),
  );
}

export function uploadStorefrontEvidence(
  customerToken: string,
  orderID: string,
  evidence: StorefrontOrderEvidence,
): Promise<StorefrontOrder> {
  return request(() =>
    axios_storefront.patch(
      `/storefront/${pathSegment(customerToken)}/orders/${pathSegment(orderID)}/evidence`,
      evidence,
    ),
  );
}

export function cancelStorefrontOrder(
  customerToken: string,
  orderID: string,
): Promise<StorefrontOrder> {
  return request(() =>
    axios_storefront.delete(
      `/storefront/${pathSegment(customerToken)}/orders/${pathSegment(orderID)}`,
    ),
  );
}
