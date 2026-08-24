import Stock_f from "../../../API/StockService/Stock";
import { formProduct_t, LogAuditQuery_t, LogAuditQueryResult_t, LogAudit_t, logReq_t, logRes_t, productInfo_t, productRes_t, queryProduct_t, stockForm_t, stockInForm_t, stockLogUpdateForm_t, stockOutForm_t, stockReq_t, stockStatus_t } from "../../../API/StockService/type";
import { AuthContext_t } from "../../../context/AuthContextCore";
import ApiWithRetry, { resApiWithRetry_t } from "../../../lib/apiWithRetry";


interface resProductWithRetry_t extends resApiWithRetry_t {
    data?: productRes_t;
}
interface resStockWithRetry_t extends resApiWithRetry_t {
    data?: productInfo_t[];
}
interface resStatusWithRetry_t extends resApiWithRetry_t {
    data?: stockStatus_t;
}
interface resStockOutWithRetry_t extends resApiWithRetry_t {
    data?: stockForm_t[];
}
interface resLogWithRetry_t extends resApiWithRetry_t {
    data?: logRes_t;
}
interface resLogAuditWithRetry_t extends resApiWithRetry_t {
    data?: LogAudit_t;
}
interface resLogAuditQueryWithRetry_t extends resApiWithRetry_t {
    data?: LogAuditQueryResult_t;
}

export async function getProduct(context: AuthContext_t, condition?: queryProduct_t): Promise<resProductWithRetry_t> {
    try {
        const res: resProductWithRetry_t = await ApiWithRetry(context, Stock_f.getProduct, condition);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function postProduct(context: AuthContext_t, data: formProduct_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.postProduct, data);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function putProduct(context: AuthContext_t, data: formProduct_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.putProduct, data);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function delProduct(context: AuthContext_t, id: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.delProduct, id);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function getStatus(context: AuthContext_t): Promise<resStatusWithRetry_t> {
    try {
        const res: resStatusWithRetry_t = await ApiWithRetry(context, Stock_f.getStatus);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function getLog(context: AuthContext_t, req:logReq_t): Promise<resLogWithRetry_t> {
    try {
        const res: resLogWithRetry_t = await ApiWithRetry(context, Stock_f.getLog, req);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function getStock(context: AuthContext_t, condition?: stockReq_t): Promise<resStockWithRetry_t> {
    try {
        const res: resStockWithRetry_t = await ApiWithRetry(context, Stock_f.getStock, condition);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function postStockOut(context: AuthContext_t, data: stockOutForm_t): Promise<resStockOutWithRetry_t> {
    try {
        const res: resStockOutWithRetry_t = await ApiWithRetry(context, Stock_f.postStockOut, data);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function postStockIn(context: AuthContext_t, data: stockInForm_t): Promise<resStockOutWithRetry_t> {
    try {
        const res: resStockOutWithRetry_t = await ApiWithRetry(context, Stock_f.postStockIn, data);
        return res;
    } catch (err) {
        throw err;
    }
}
export async function putLog(context: AuthContext_t, data: stockLogUpdateForm_t): Promise<resApiWithRetry_t> {
    return ApiWithRetry(context, Stock_f.putLog, data);
}
export async function getLogAudit(context: AuthContext_t, id: string): Promise<resLogAuditWithRetry_t> {
    return ApiWithRetry(context, Stock_f.getLogAudit, id) as Promise<resLogAuditWithRetry_t>;
}
export async function queryLogAudit(context: AuthContext_t, query: LogAuditQuery_t): Promise<resLogAuditQueryWithRetry_t> {
    return ApiWithRetry(context, Stock_f.queryLogAudit, query) as Promise<resLogAuditQueryWithRetry_t>;
}


const stockWithRetry_f = {
    getProduct,
    postProduct,
    delProduct,
    putProduct,
    getStatus,
    getLog,
    putLog,
    getStock,
    postStockOut,
    postStockIn,
    getLogAudit,
    queryLogAudit,
}

export default stockWithRetry_f; 
