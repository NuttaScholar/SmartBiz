import { DailyTotal_t } from "../API/AccountService/type";
import { transactionType_e } from "../enum";

export type sumTrans_t = {
    total: number;
    income: number;
    expenses: number;
}
export function sumDailyTotal(val: DailyTotal_t): sumTrans_t {
    const totalMoney = val.transactions?.reduce(
        (sum, transaction) => {
            return transaction.type === transactionType_e.income ||
                transaction.type === transactionType_e.loan
                ? {
                    total: sum.total + transaction.money,
                    income: sum.income + transaction.money,
                    expenses: sum.expenses,
                }
                : {
                    total: sum.total - transaction.money,
                    income: sum.income,
                    expenses: sum.expenses + transaction.money,
                };
        },
        { total: 0, income: 0, expenses: 0 } as sumTrans_t
    );
    return totalMoney || { total: 0, income: 0, expenses: 0 };
}