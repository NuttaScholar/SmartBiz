import axios from "axios";

const acceptClientErrorStatus = (status: number) => status < 500;

export const axios_login = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_user = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_account = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_storage = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_STORE}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_stock = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_STOCK}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});

export const axios_bill = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_BILL}`,
    withCredentials: true,
    validateStatus: acceptClientErrorStatus,
});
