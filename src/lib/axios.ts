import axios from "axios";

const acceptClientErrorStatus = (status: number) => status < 500;

export const axios_login = axios.create({
    baseURL: "/api/login",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_user = axios.create({
    baseURL: "/api/login",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_account = axios.create({
    baseURL: "/api/account",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storage = axios.create({
    baseURL: "/api/storage",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_stock = axios.create({
    baseURL: "/api/stock",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_bill = axios.create({
    baseURL: "/api/bill",
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storefront = axios.create({
    baseURL: "/api/storefront",
    validateStatus: acceptClientErrorStatus,
});
