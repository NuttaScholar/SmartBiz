import axios from "axios";

export const axios_login = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN}`,
    withCredentials: true,    
});

export const axios_user = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN}`,
    withCredentials: true,
});

export const axios_account = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS}`,
    withCredentials: true,
});

export const axios_storage = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_STORE}`,
    withCredentials: true,
});

export const axios_stock = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_STOCK}`,
    withCredentials: true,
});