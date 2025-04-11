export enum transactionType_e {
    income,
    expenses,
    loan,
    lend,
};
export type transactionDetail_t = {
    id: number;
    topic: string;
    type: transactionType_e;
    money: number;
    who?: string;
    description?: string;
};
export type DailyTotal_t = {
    date: Date;
    transactions?: transactionDetail_t[] | null;
};
export type statement_t = {
    date: Date;
    detail: DailyTotal_t[];
}
