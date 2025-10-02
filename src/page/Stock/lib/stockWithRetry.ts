import Stock_f from "../../../API/StockService/Stock";
import { productInfo_t, queryProduct_t } from "../../../API/StockService/type";
import { AuthContext_t } from "../../../context/AuthContext";
import ApiWithRetry, { resApiWithRetry_t } from "../../../lib/apiWithRetry";


interface resProductWithRetry_t extends resApiWithRetry_t {
    result?: productInfo_t[];
}

export async function getProduct(context: AuthContext_t, condition: queryProduct_t): Promise<resProductWithRetry_t> {
    try {
        const res: resProductWithRetry_t = await ApiWithRetry(context, Stock_f.getProduct, condition);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function postProduct(context: AuthContext_t, data: productInfo_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Stock_f.postProduct, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}


const stockWithRetry_f = {
    getProduct,
    postProduct
}

export default stockWithRetry_f; 