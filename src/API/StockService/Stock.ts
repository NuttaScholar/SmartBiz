import { axios_stock } from "../../lib/axios";
import { formProduct_t, LogAuditQuery_t, logReq_t, queryProduct_t, responst_t, stockInForm_t, stockLogUpdateForm_t, stockOutForm_t, stockReq_t } from "./type";

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
    condition?: stockReq_t
): Promise<responst_t<"getStock">> {
    try {
        const query = buildStockQuery(condition);
        const res = await axios_stock.get(
            query ? `/stock?${query}` : `/stock`,
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
export async function putLog(
    token: string,
    data: stockLogUpdateForm_t
): Promise<responst_t<"none">> {
    const { id, ...body } = data;
    const res = await axios_stock.put(
        `/log/${encodeURIComponent(id)}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as responst_t<"none">;
}

export async function delLog(
    token: string,
    id: string
): Promise<responst_t<"none">> {
    const res = await axios_stock.delete(
        `/log/${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as responst_t<"none">;
}

function buildStockQuery(condition?: stockReq_t) {
    if (!condition || condition.productType === undefined) return "";

    const productTypes = Array.isArray(condition.productType)
        ? condition.productType
        : [condition.productType];

    const params = new URLSearchParams();
    productTypes.forEach((type) => params.append("productType", String(type)));
    return params.toString();
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
        const { bill_Img, who, date, ...rest } = data;
        formData.append("products", JSON.stringify(rest.products));
        formData.append("date", date.toISOString());
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

export async function getLogAudit(
    token: string,
    id: string,
): Promise<responst_t<"getLogAudit">> {
    const res = await axios_stock.get(`/log-audit/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as responst_t<"getLogAudit">;
}

export async function queryLogAudit(
    token: string,
    query: LogAuditQuery_t,
): Promise<responst_t<"queryLogAudit">> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        params.set(key, value instanceof Date ? value.toISOString() : String(value));
    });
    const res = await axios_stock.get(`/log-audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as responst_t<"queryLogAudit">;
}


const Stock_f = {
    getProduct,
    postProduct,
    delProduct,
    putProduct,
    getStatus,
    getLog,
    putLog,
    delLog,
    getStock,
    postStockOut,
    postStockIn,
    getLogAudit,
    queryLogAudit,
}

export default Stock_f;
