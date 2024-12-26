import React from 'react'
import Accordion from '@mui/material/Accordion';
import DailyTotal from './DailyTotal';
import TransactionDetail, { transactionDetail_t, transactionType_e } from './TransactionDetail';

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
  const totalMoney = transactions?.reduce((sum, transaction) => {
    return transaction.type === transactionType_e.income || transaction.type === transactionType_e.lone ? sum + transaction.money : sum - transaction.money;
  }, 0);
  const dateNumber = date.getDate();
  /* Return */
  return (
    <Accordion
      sx={AccordionBox}
    >
      <DailyTotal value={{ day: dateNumber, money: totalMoney || 0 }} />

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