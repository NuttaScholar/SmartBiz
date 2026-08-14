import Access_f from "../../../API/AccountService/Account";
import {
    LogAuditQuery_t,
    LogAuditQueryResult_t,
    LogAudit_t,
    SearchTransForm_t,
    statement_t,
    TransitionForm_t,
} from "../../../API/AccountService/type";
import { AuthContext_t } from "../../../context/AuthContextCore";
import ApiWithRetry, { resApiWithRetry_t } from "../../../lib/apiWithRetry";

interface resStatementWithRetry_t extends resApiWithRetry_t {
    data?: statement_t[];
}
interface resSlipWithRetry_t extends resApiWithRetry_t {
    data?: TransitionForm_t;
}
interface resWalletWithRetry_t extends resApiWithRetry_t {
    data?: number;
}
interface resLogAuditWithRetry_t extends resApiWithRetry_t {
    data?: LogAudit_t;
}
interface resLogAuditQueryWithRetry_t extends resApiWithRetry_t {
    data?: LogAuditQueryResult_t;
}

export async function get(context: AuthContext_t, condition: SearchTransForm_t): Promise<resStatementWithRetry_t> {
    return ApiWithRetry(context, Access_f.get, condition) as Promise<resStatementWithRetry_t>;
}

export async function getSlip(context: AuthContext_t, condition: SearchTransForm_t): Promise<resSlipWithRetry_t> {
    return ApiWithRetry(context, Access_f.getDetail, condition) as Promise<resSlipWithRetry_t>;
}

export async function getWallet(context: AuthContext_t): Promise<resWalletWithRetry_t> {
    return ApiWithRetry(context, Access_f.getWallet) as Promise<resWalletWithRetry_t>;
}

export async function post(context: AuthContext_t, data: TransitionForm_t): Promise<resApiWithRetry_t> {
    return ApiWithRetry(context, Access_f.post, data);
}

export async function put(context: AuthContext_t, data: TransitionForm_t): Promise<resApiWithRetry_t> {
    return ApiWithRetry(context, Access_f.put, data);
}

export async function del(context: AuthContext_t, id: string): Promise<resApiWithRetry_t> {
    return ApiWithRetry(context, Access_f.del, id);
}

export async function getLogAudit(context: AuthContext_t, id: string): Promise<resLogAuditWithRetry_t> {
    return ApiWithRetry(context, Access_f.getLogAudit, id) as Promise<resLogAuditWithRetry_t>;
}

export async function queryLogAudit(context: AuthContext_t, query: LogAuditQuery_t): Promise<resLogAuditQueryWithRetry_t> {
    return ApiWithRetry(context, Access_f.queryLogAudit, query) as Promise<resLogAuditQueryWithRetry_t>;
}

const accessWithRetry_f = {
    get,
    getSlip,
    getWallet,
    post,
    put,
    del,
    getLogAudit,
    queryLogAudit,
}

export default accessWithRetry_f;
