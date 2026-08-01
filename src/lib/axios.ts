import axios from "axios";
import { serviceUrl } from "./serviceUrl";

const acceptClientErrorStatus = (status: number) => status < 500;

export const axios_login = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_LOGIN),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_user = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_LOGIN),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_account = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_ACCESS),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storage = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_STORE),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_stock = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_STOCK),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_bill = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_BILL),
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storefront = axios.create({
    baseURL: serviceUrl(import.meta.env.VITE_PORT_STOREFRONT),
    validateStatus: acceptClientErrorStatus,
});
