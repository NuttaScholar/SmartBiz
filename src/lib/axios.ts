import axios from "axios";

const acceptClientErrorStatus = (status: number) => status < 500;
const apiGatewayOrigin = (import.meta.env.VITE_API_GATEWAY_URL || "").replace(/\/+$/, "");
const gatewayApi = (service: string) => `${apiGatewayOrigin}/api/${service}`;

export const axios_login = axios.create({
    baseURL: gatewayApi("login"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_user = axios.create({
    baseURL: gatewayApi("login"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_account = axios.create({
    baseURL: gatewayApi("account"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storage = axios.create({
    baseURL: gatewayApi("storage"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_stock = axios.create({
    baseURL: gatewayApi("stock"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_bill = axios.create({
    baseURL: gatewayApi("bill"),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storefront = axios.create({
    baseURL: gatewayApi("storefront"),
    validateStatus: acceptClientErrorStatus,
});
