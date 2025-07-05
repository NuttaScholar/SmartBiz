// src/hooks/useAxios.ts
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { service_e } from "../enum";
import { axios_account, axios_login } from "../lib/axios";

const useAxios = (service: service_e) => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAxios must be used within an AuthProvider");
    }
    const { auth } = context;
    const instance = useMemo(() => {
        switch (service) {
            case service_e.account:
                axios_account.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
                return axios_account;
            case service_e.login:
                return axios_login;
        }
    }, [auth.token, service]);

    return instance;
};

export default useAxios;
