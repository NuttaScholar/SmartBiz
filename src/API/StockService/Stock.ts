import { axios_stock } from "../../lib/axios";
import { formProduct_t, logReq_t, queryProduct_t, responst_t, stockInForm_t, stockOutForm_t } from "./type";

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
    condition?: queryProduct_t
): Promise<responst_t<"getProduct">> {
    try {
        if (condition) {
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
        } else {
            const res = await axios_stock.get(
                `/product`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return res.data as responst_t<"getProduct">;
        }
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
export async function getLog(
    token: string,
    req: logReq_t
): Promise<responst_t<"getLog">> {
    try {
        const { id, type, index, size } = req;
        let query: string = `id=${id}&type=${type}`;
        (index !== undefined) && (query += `&index=${index}`);
        (size !== undefined) && (query += `&size=${size}`);

        const res = await axios_stock.get(
            `/log?${query}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data as responst_t<"getLog">;

    } catch (err) {
        throw err;
    }
}
export async function getStock(
    token: string,
): Promise<responst_t<"getStock">> {
    try {
        const res = await axios_stock.get(
            `/stock`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data as responst_t<"getStock">;

    } catch (err) {
        throw err;
    }
}
export async function postStockOut(token: string,
    data: stockOutForm_t): Promise<responst_t<"postStock">> {
    try {
        const res = await axios_stock.post(
            `/stock_out`,
            data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responst_t<"postStock">;
    } catch (err) {
        throw err;
    }
}
export async function postStockIn(token: string,
    data: stockInForm_t): Promise<responst_t<"postStock">> {
    try {
        const formData = new FormData();
        const { bill_Img, who, ...rest } = data;
        formData.append("products", JSON.stringify(rest.products));
        who && formData.append("who", who);
        bill_Img && formData.append("file", bill_Img);
        const res = await axios_stock.post(
            `/stock_in`,
            formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responst_t<"postStock">;
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
    getLog,
    getStock,
    postStockOut,
    postStockIn,
}

export default Stock_f;