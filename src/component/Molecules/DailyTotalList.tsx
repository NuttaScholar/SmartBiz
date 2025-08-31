import React, { useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import DailyTotal from "./DailyTotal";
import TransactionDetail, { transactionDetail_t } from "./TransactionDetail";
import { sumDailyTotal } from "../../lib/calculate";

/**************************************************** */
//  Style
/**************************************************** */
const AccordionBox: React.CSSProperties = {
  maxWidth: "480px",
  minWidth: "300px",
  width: "100%",
};

/**************************************************** */
//  Type
/**************************************************** */
export type DailyTotal_t = {
  date: Date;
  transactions?: transactionDetail_t[] | null;
};

/**************************************************** */
//  Function
/**************************************************** */

/**************************************************** */
//  Interface
/**************************************************** */
interface DailyTotalListProps {
  value: DailyTotal_t;
  onClick?: (date: Date, value: transactionDetail_t) => void;
  expanded?: boolean;
  onExpanded?: (
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean
  ) => void;
}

/**************************************************** */
//  Component
/**************************************************** */
const DailyTotalList: React.FC<DailyTotalListProps> = (Props) => {
  /* Local Variable */
  const transactions = Props.value.transactions;
  const date = new Date(Props.value.date);
  const totalMoney = useMemo(() => {
    return sumDailyTotal(Props.value);
  }, [Props.value]);
  const dateNumber = date.getDate();

  /* Local Function */
  const onClickHandle = (value: transactionDetail_t) => {
    Props.onClick?.(date, value);
  };

  /* Return */
  return (
    <Accordion
      sx={AccordionBox}
      defaultExpanded
      expanded={Props.expanded}
      onChange={Props.onExpanded}
    >
      <DailyTotal day={dateNumber} money={totalMoney.total || 0} />

      {transactions?.map((transaction, index) => (
        <TransactionDetail
          key={index}
          value={transaction}
          onClick={onClickHandle}
        />
      ))}
    </Accordion>
  );
};

export default DailyTotalList;
