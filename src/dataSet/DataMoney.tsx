import { DailyTotal_t } from "../component/Molecules/DailyTotalList";
import { transactionType_e } from "../type";

export const DailyMoneyList: DailyTotal_t[] = [
  {
    date: new Date(2024, 8, 3),
    transactions: [
      {
        id: 1,
        money: 200.5,
        type: transactionType_e.income,
        topic: "Part time",
        who: "Nut"
      },
      {
        id: 2,
        money: 100.0,
        type: transactionType_e.expenses,
        topic: "Eating",
        description: "Buying drinks and food dinner.",
      },
      {
        id: 3,
        money: 125.75,
        type: transactionType_e.expenses,
        topic: "Hobby",
        description: "Buying toys.",
      },
    ],
  },
  {
    date: new Date(2024, 8, 2),
    transactions: [
      {
        id: 4,
        money: 200.5,
        type: transactionType_e.loan,
        topic: "ยืมเงิน"
      },
      {
        id: 5,
        money: 200.5,
        type: transactionType_e.lend,
        topic: "ให้ยืมเงิน"
      },
    ],
  },
  {
    date: new Date(2024, 8, 1),
    transactions: [
      {
        id: 6,
        money: 200.5,
        type: transactionType_e.loan,
        topic: "ยืมเงิน"
      },
      {
        id: 7,
        money: 200.5,
        type: transactionType_e.loan,
        topic: "ยืมเงิน"
      },
    ],
  },
];
