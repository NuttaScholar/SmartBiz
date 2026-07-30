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

export type CustomerLink = {
  customerID: string;
  customerName: string;
  token: string;
  path: string;
};

export type StorefrontProductDiscount = {
  productID: string;
  discountPercent: number;
};

export type CustomerLinkSummary = {
  customerID: string;
  customerName: string;
  isActive: boolean;
  productDiscounts: StorefrontProductDiscount[];
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

function unwrap<T>(
  response: StorefrontApiResponse<T>,
  httpStatus?: number,
): T {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  throw new StorefrontApiError(
    response.message || "ไม่สามารถเชื่อมต่อบริการหน้าร้านได้",
    response.status || httpStatus,
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
  operation: () => Promise<{
    data: StorefrontApiResponse<T>;
    status: number;
  }>,
): Promise<T> {
  try {
    const response = await operation();
    return unwrap(response.data, response.status);
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

function adminAuth(accessToken: string) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export function getCustomerLink(
  accessToken: string,
  customerID: string,
): Promise<CustomerLink> {
  return request(() =>
    axios_storefront.get(
      `/storefront/admin/customer-links/${pathSegment(customerID)}`,
      adminAuth(accessToken),
    ),
  );
}

export function listCustomerLinks(
  accessToken: string,
): Promise<CustomerLinkSummary[]> {
  return request(() =>
    axios_storefront.get(
      "/storefront/admin/customer-links",
      adminAuth(accessToken),
    ),
  );
}

export function createCustomerLink(
  accessToken: string,
  customerID: string,
): Promise<CustomerLink> {
  return request(() =>
    axios_storefront.post(
      "/storefront/admin/customer-links",
      { customerID },
      adminAuth(accessToken),
    ),
  );
}

export function rotateCustomerToken(
  accessToken: string,
  customerID: string,
): Promise<CustomerLink> {
  return request(() =>
    axios_storefront.patch(
      `/storefront/admin/customer-links/${pathSegment(customerID)}/token`,
      undefined,
      adminAuth(accessToken),
    ),
  );
}
