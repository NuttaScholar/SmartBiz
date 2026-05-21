import { AxiosError } from "axios";
import { axios_bill } from "../../lib/axios";
import {
    billStatus_e,
    errorCode_e,
} from "../../enum";
import {
    createOrderForm_t,
    discount_t,
    order_t,
    responst_t,
    searchOrderForm_t,
    updateDiscountForm_t,
    updateOrderForm_t,
} from "./type";

type billApiResponse_t<T> = {
    success: boolean;
    data?: T;
    errCode?: errorCode_e;
    message?: string;
};

function authHeader(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

function toResponse<T>(data: billApiResponse_t<T>) {
    if (data.success) {
        return {
            status: "success" as const,
            result: data.data,
            message: data.message,
        };
    }

    return {
        status: "error" as const,
        errCode: data.errCode ?? errorCode_e.UnknownError,
        message: data.message,
    };
}

function toErrorResponse(err: unknown) {
    const axiosError = err as AxiosError<billApiResponse_t<unknown>>;
    if (axiosError.response?.data) {
        return toResponse(axiosError.response.data);
    }

    return {
        status: "error" as const,
        errCode: errorCode_e.UnknownError,
        message: `${err}`,
    };
}

function orderQuery(condition?: searchOrderForm_t) {
    const params = new URLSearchParams();
    condition?.customerID && params.append("customerID", condition.customerID);
    condition?.orderID && params.append("orderID", condition.orderID);
    const query = params.toString();
    return query ? `?${query}` : "";
}

export async function searchOrders(
    token: string,
    condition?: searchOrderForm_t
): Promise<responst_t<"getOrders">> {
    try {
        const res = await axios_bill.get(`/bill/search${orderQuery(condition)}`, authHeader(token));
        return toResponse<order_t[]>(res.data) as responst_t<"getOrders">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"getOrders">;
    }
}

export async function getOrdersByStatus(
    token: string,
    status: billStatus_e
): Promise<responst_t<"getOrders">> {
    try {
        const res = await axios_bill.get(`/bill/status/${status}`, authHeader(token));
        return toResponse<order_t[]>(res.data) as responst_t<"getOrders">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"getOrders">;
    }
}

export async function postOrder(
    token: string,
    data: createOrderForm_t
): Promise<responst_t<"none">> {
    try {
        const res = await axios_bill.post("/bill", data, authHeader(token));
        return toResponse<order_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

export async function putOrder(
    token: string,
    data: updateOrderForm_t & { orderID: string }
): Promise<responst_t<"none">> {
    try {
        const { orderID, ...body } = data;
        const res = await axios_bill.put(`/bill/${orderID}`, body, authHeader(token));
        return toResponse<order_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

export async function delOrder(
    token: string,
    orderID: string
): Promise<responst_t<"deleteOrder">> {
    try {
        const res = await axios_bill.delete(`/bill/${orderID}`, authHeader(token));
        return toResponse(res.data) as responst_t<"deleteOrder">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"deleteOrder">;
    }
}

export async function nextStep(
    token: string,
    orderID: string
): Promise<responst_t<"none">> {
    try {
        const res = await axios_bill.patch(`/bill/${orderID}/next`, undefined, authHeader(token));
        return toResponse<order_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

export async function markBillingAsIncome(
    token: string,
    orderID: string
): Promise<responst_t<"none">> {
    try {
        const res = await axios_bill.patch(`/bill/${orderID}/billing/income`, undefined, authHeader(token));
        return toResponse<order_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

export async function markBillingAsDebt(
    token: string,
    orderID: string
): Promise<responst_t<"none">> {
    try {
        const res = await axios_bill.patch(`/bill/${orderID}/billing/debt`, undefined, authHeader(token));
        return toResponse<order_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

export async function getOrderStatus(
    token: string,
    orderID: string
): Promise<responst_t<"getOrderStatus">> {
    try {
        const res = await axios_bill.get(`/bill/${orderID}/status`, authHeader(token));
        return toResponse<billStatus_e>(res.data) as responst_t<"getOrderStatus">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"getOrderStatus">;
    }
}

export async function getDiscounts(
    token: string,
    customerID: string
): Promise<responst_t<"getDiscount">> {
    try {
        const res = await axios_bill.get(`/discount/${customerID}`, authHeader(token));
        return toResponse<discount_t>(res.data) as responst_t<"getDiscount">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"getDiscount">;
    }
}

export async function putDiscounts(
    token: string,
    data: updateDiscountForm_t & { customerID: string }
): Promise<responst_t<"none">> {
    try {
        const { customerID, ...body } = data;
        const res = await axios_bill.put(`/discount/${customerID}`, body, authHeader(token));
        return toResponse<discount_t>(res.data) as responst_t<"none">;
    } catch (err) {
        return toErrorResponse(err) as responst_t<"none">;
    }
}

const Bill_f = {
    searchOrders,
    getOrdersByStatus,
    postOrder,
    putOrder,
    delOrder,
    nextStep,
    markBillingAsIncome,
    markBillingAsDebt,
    getOrderStatus,
    getDiscounts,
    putDiscounts,
};

export default Bill_f;
