import React from 'react'
import Accordion from '@mui/material/Accordion';
import DailyTotal from './DailyTotal';
import TransactionDetail, { transactionDetail_t } from './TransactionDetail';
import { transactionType_e } from '../../enum';

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
  onClick?: (date: Date,value: transactionDetail_t) => void;
}

/**************************************************** */
//  Component
/**************************************************** */
const DailyTotalList: React.FC<DailyTotalListProps> = (Props) => {
  /* Local Variable */
  const transactions = Props.value.transactions;
  const date = new Date(Props.value.date);
  const totalMoney = sumDailyTotal(Props.value);
  const dateNumber = date.getDate();

  /* Local Function */
  const onClickHandle = (value: transactionDetail_t)=>{
    Props.onClick?.(date, value);
  }

  /* Return */
  return (
    <Accordion
      sx={AccordionBox}
      defaultExpanded
    >
      <DailyTotal day={dateNumber} money = {totalMoney || 0}  />

      {transactions?.map((transaction, index) => (
        <TransactionDetail
          key={index}
          value={transaction}
          onClick={onClickHandle}
        />
      ))}
    </Accordion>
  )
}

export default DailyTotalList