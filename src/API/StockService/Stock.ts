import { axios_stock } from "../../lib/axios";
import { formProduct_t, queryProduct_t, responst_t } from "./type";

export async function postProduct(
    token: string,
    data: formProduct_t
): Promise<responst_t<"none">> {
    try {
        const formData = new FormData();
        const { img, ...rest } = data;
        Object.entries(rest).forEach(([key, val]) => {
            if (val !== undefined && val !== null) formData.append(key, String(val));
        });
        img && formData.append("file", img);
        const res = await axios_stock.post(
            `/product`,
            formData, {
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
export async function putProduct(
    token: string,
    data: formProduct_t
): Promise<responst_t<"none">> {
    try {
        const formData = new FormData();
        const { img, ...rest } = data;
        Object.entries(rest).forEach(([key, val]) => {
            if (val !== undefined && val !== null) formData.append(key, String(val));
        });
        console.log("img", img);
        if (img) {
            formData.append("file", img);
        } else if (img === null) {
            formData.append("img", "");
        }
        const res = await axios_stock.put(
            `/product`,
            formData, {
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
export async function delProduct(
    token: string,
    id: string
): Promise<responst_t<"none">> {
    try {
        const res = await axios_stock.delete(
            `/product?id=${id}`,
            {
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
export async function getStatus(
    token: string
): Promise<responst_t<"getStatus">> {
    try {
        const res = await axios_stock.get("/status", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data as responst_t<"getStatus">;
    } catch (err) {
        throw err;
    }
}

const Stock_f = {
    getProduct,
    postProduct,
    delProduct,
    putProduct,
    getStatus,
}

export default Stock_f;