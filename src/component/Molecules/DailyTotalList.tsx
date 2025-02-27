import React from 'react'
import Accordion from '@mui/material/Accordion';
import DailyTotal from './DailyTotal';
import TransactionDetail, { transactionDetail_t } from './TransactionDetail';
import { transactionType_e } from '../../type';

/**************************************************** */
//  Style
/**************************************************** */
const AccordionBox: React.CSSProperties = {
  maxWidth: "480px",
  minWidth: "300px",
  width: "100%",
}

/**************************************************** */
//  Type
/**************************************************** */
export type DailyTotal_t = {
  date: Date;
  transactions?: transactionDetail_t[] | null;
}
/**************************************************** */
//  Function
/**************************************************** */
export function sumDailyTotal(val: DailyTotal_t): number {
  const totalMoney = val.transactions?.reduce((sum, transaction) => {
    return transaction.type === transactionType_e.income ||
      transaction.type === transactionType_e.loan
      ? sum + transaction.money
      : sum - transaction.money;
  }, 0);
  return totalMoney || 0;
}
/**************************************************** */
//  Interface
/**************************************************** */
interface DailyTotalListProps {
  value: DailyTotal_t;
  onClick?: (id: number) => void;
}

/**************************************************** */
//  Component
/**************************************************** */
const DailyTotalList: React.FC<DailyTotalListProps> = (Props) => {
  /* Local Variable */
  const { transactions, date } = Props.value;
  const totalMoney = sumDailyTotal(Props.value)
  const dateNumber = date.getDate();
  /* Return */
  return (
    <Accordion
      sx={AccordionBox}
    >
      <DailyTotal day={dateNumber} money = {totalMoney || 0}  />

      {transactions?.map((transaction, index) => (
        <TransactionDetail
          key={index}
          value={transaction}
          onClick={Props.onClick}
        />
      ))}
    </Accordion>
  )
}

export default DailyTotalList