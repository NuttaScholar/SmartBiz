import Stock_f from "../../../API/StockService/Stock";
import { formProduct_t, productRes_t, queryProduct_t, stockStatus_t } from "../../../API/StockService/type";
import { AuthContext_t } from "../../../context/AuthContext";
import ApiWithRetry, { resApiWithRetry_t } from "../../../lib/apiWithRetry";


interface resProductWithRetry_t extends resApiWithRetry_t {
    result?: productRes_t;
}
interface resStatusWithRetry_t extends resApiWithRetry_t {
    result?: stockStatus_t;
}

export async function getProduct(context: AuthContext_t, condition: queryProduct_t): Promise<resProductWithRetry_t> {
    try {
        const res: resProductWithRetry_t = await ApiWithRetry(context, Stock_f.getProduct, condition);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function postProduct(context: AuthContext_t, data: formProduct_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.postProduct, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function putProduct(context: AuthContext_t, data: formProduct_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.putProduct, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function delProduct(context: AuthContext_t, id: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.delProduct, id);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function getStatus(context: AuthContext_t): Promise<resStatusWithRetry_t> {
    try {
        const res: resStatusWithRetry_t = await ApiWithRetry(context, Stock_f.getStatus);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

const stockWithRetry_f = {
    getProduct,
    postProduct,
    delProduct,
    putProduct,
    getStatus,
}

export default stockWithRetry_f; 