import Bill_f from "../../../API/BillService/Bill";
import {
    createOrderForm_t,
    discount_t,
    orderInfo_t,
    orderStatusCount_t,
    searchOrderForm_t,
    updateDiscountForm_t,
    updateOrderForm_t,
} from "../../../API/BillService/type";
import { AuthContext_t } from "../../../context/AuthContext";
import { billStatus_e } from "../../../enum";
import ApiWithRetry, { resApiWithRetry_t } from "../../../lib/apiWithRetry";

interface resOrdersWithRetry_t extends resApiWithRetry_t {
    result?: orderInfo_t[];
}

interface resOrderStatusWithRetry_t extends resApiWithRetry_t {
    result?: billStatus_e;
}

interface resOrderStatusCountsWithRetry_t extends resApiWithRetry_t {
    result?: orderStatusCount_t[];
}

interface resDiscountWithRetry_t extends resApiWithRetry_t {
    result?: discount_t;
}

export async function searchOrders(context: AuthContext_t, condition?: searchOrderForm_t): Promise<resOrdersWithRetry_t> {
    try {
        const res: resOrdersWithRetry_t = await ApiWithRetry(context, Bill_f.searchOrders, condition);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function getOrdersByStatus(context: AuthContext_t, status: billStatus_e): Promise<resOrdersWithRetry_t> {
    try {
        const res: resOrdersWithRetry_t = await ApiWithRetry(context, Bill_f.getOrdersByStatus, status);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function getOrderStatusCounts(
    context: AuthContext_t,
    condition?: Pick<searchOrderForm_t, "customerID" | "orderID">
): Promise<resOrderStatusCountsWithRetry_t> {
    try {
        const res: resOrderStatusCountsWithRetry_t = await ApiWithRetry(context, Bill_f.getOrderStatusCounts, condition);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function postOrder(context: AuthContext_t, data: createOrderForm_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.postOrder, data);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function putOrder(context: AuthContext_t, data: updateOrderForm_t & { orderID: string }): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.putOrder, data);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function delOrder(context: AuthContext_t, orderID: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.delOrder, orderID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function nextStep(context: AuthContext_t, orderID: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.nextStep, orderID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function markBillingAsIncome(context: AuthContext_t, orderID: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.markBillingAsIncome, orderID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function markBillingAsDebt(context: AuthContext_t, orderID: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.markBillingAsDebt, orderID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function getOrderStatus(context: AuthContext_t, orderID: string): Promise<resOrderStatusWithRetry_t> {
    try {
        const res: resOrderStatusWithRetry_t = await ApiWithRetry(context, Bill_f.getOrderStatus, orderID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function getDiscounts(context: AuthContext_t, customerID: string): Promise<resDiscountWithRetry_t> {
    try {
        const res: resDiscountWithRetry_t = await ApiWithRetry(context, Bill_f.getDiscounts, customerID);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function putDiscounts(context: AuthContext_t, data: updateDiscountForm_t & { customerID: string }): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Bill_f.putDiscounts, data);
        return res;
    } catch (err) {
        throw err;
    }
}

const billWithRetry_f = {
    searchOrders,
    getOrdersByStatus,
    getOrderStatusCounts,
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

export default billWithRetry_f;
