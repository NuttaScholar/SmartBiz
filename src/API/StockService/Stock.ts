import { axios_stock } from "../../lib/axios";
import { productInfo_t, queryProduct_t, responst_t } from "./type";

export async function postProduct(
    token: string,
    data: productInfo_t
): Promise<responst_t<"none">> {
    try {
        const res = await axios_stock.post(
            `/product`,
            data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responst_t<"none">;
    } catch (err) {
        throw err;
    }
}
export async function getProduct(
    token: string,
    condition: queryProduct_t
): Promise<responst_t<"none">> {
    try {
        const { name, status, type } = condition;
        let query: string = `type=${type}`;
        name && (query += `&name=${name}`);
        status && (query += `&status=${status}`);

        const res = await axios_stock.get(
            `/product?${query}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data as responst_t<"getProduct">;
    } catch (err) {
        throw err;
    }
}

const Stock_f = {
    getProduct,
    postProduct,
}

export default Stock_f;