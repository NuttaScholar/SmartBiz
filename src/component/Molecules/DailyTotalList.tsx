import React from 'react'
import Accordion from '@mui/material/Accordion';

import DailyTotal from './DailyTotal';
import TransactionDetail, { transactionProp } from './TransactionDetail';

/* Style */

const AccordionBox: React.CSSProperties = {
  width: "350px"
}

/* Style */

/* Props */

export interface DailyMoneyProps {
  at: Date;
  transactions: transactionProp[];
}

interface DailyTotalListProps {
  value: DailyMoneyProps;
}

/* Props */

const DailyTotalList: React.FC<DailyTotalListProps> = (Props) => {
  const { transactions, at } = Props.value;

  const totalMoney = transactions.reduce((sum, transaction) => {
    return transaction.Income ? sum + transaction.money : sum - transaction.money;
  }, 0);
  const dateNumber = at.getDate();

  const transactionSelected = (id: string) => {
    alert(`Selected transaction at ${id}`);
  }

  return (
    <Accordion
      sx={AccordionBox}
    >
      <DailyTotal Day={dateNumber} Money={totalMoney} />

      {transactions.map((transaction, index) => (
        <TransactionDetail
          key={index}
          id={transaction.id}
          name={transaction.name}
          money={transaction.money}
          description={transaction.description}
          Income={transaction.Income}
          onClick={transactionSelected}
        />
      ))}
    </Accordion>
  )
}

export default DailyTotalList