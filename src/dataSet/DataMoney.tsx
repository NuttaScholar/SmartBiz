import { DailyMoneyProps } from "../component/Molecules/DailyTotalList";

interface moneyPerMonth {
    income: GLfloat;
    expenses: GLfloat;
    month: Date;
}

export const moneyPerMonthData: moneyPerMonth[] = [
    {
        income: 30000,
        expenses: 25000,
        month: new Date(2024, 7, 1),
    },
    {
        income: 32000,
        expenses: 27000,
        month: new Date(2024, 8, 1),
    },
    {
        income: 31000,
        expenses: 26000,
        month: new Date(2024, 9, 1),
    },
];

export const DailyMoneyList: DailyMoneyProps[] = [
    {
        at: new Date(2024, 7, 3),
        transactions: [
            {
                id: "7324_0001",
                money: 200.50,
                Income: true,
                name: "Part time",
                description: null,
            },
            {
                id: "7324_0002",
                money: 100.00,
                Income: false,
                name: "Eating",
                description: "Buying drinks and food dinner.",
            },
            {
                id: "7324_0003",
                money: 125.75,
                Income: false,
                name: "Hobby",
                description: "Buying toys.",
            }
        ]
    },
    {
        at: new Date(2024, 8, 2),
        transactions: [
            {
                id: "8224_0001",
                money: 400.00,
                Income: true,
                name: "Part time",
                description: null,
            },
            {
                id: "8224_0001",
                money: 150.00,
                Income: false,
                name: "Eating",
                description: "Buying drinks and food dinner.",
            }
        ]
    },
    {
        at: new Date(2024, 10, 1),
        transactions: [
            {
                id: "10124_0001",
                money: 10000.50,
                Income: true,
                name: "Income month",
                description: null,
            }
        ] 
    },
    
];