import React from "react";
import { Box, Divider, SxProps, Theme } from "@mui/material";
import Text_ThaiMonth from "../Atoms/Text_ThaiMonth";
import Text_Money from "../Atoms/Text_Money";
import DailyTotalList, {
  DailyTotal_t,
  sumDailyTotal,
} from "../Molecules/DailyTotalList";
import { DailyMoneyList } from "../../dataSet/DataMoney";
import Label_parameter from "../Atoms/Label_parameter";
import { TransitionForm_t } from "../../dialog/DialogAddTransaction";
import { transactionDetail_t } from "../Molecules/TransactionDetail";

/**************************************************** */
//  Style
/**************************************************** */
const field: SxProps<Theme> = {
  maxWidth: "480px",
  minWidth: "300px",
  width: "100%",
  bgcolor: "secondary.main",
  color: "secondary.contrastText",
  display: "flex",
  flexDirection: "column",
  padding: "32px 16px 16px 16px",
  borderRadius: "10px",
  gap: "8px",
  boxSizing: "border-box",
  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
};
const date_st: SxProps<Theme> = {
  fontSize: "26px",
  fontWeight: 500,
};
/**************************************************** */
//  Type
/**************************************************** */
export type monthlyTotal_t = {
  date: Date;
  money: number;
};
/**************************************************** */
//  Interface
/**************************************************** */
interface myProps {
  value: DailyTotal_t[];
  onClick?: (value: TransitionForm_t) => void;
}
/**************************************************** */
//  Component
/**************************************************** */
const MonthlyTotalList: React.FC<myProps> = (props) => {
  const buff = props.value.reduce(
    (sum, item) => {
      const val = sumDailyTotal(item);
      if (val < 0) {
        sum.expenses += val;
      } else {
        sum.income += val;
      }
      return sum;
    },
    { income: 0, expenses: 0 }
  );
  const total = buff.expenses + buff.income;
  return (
    <Box sx={field}>
      <Box sx={{ px: "8px" }}>
        <Box sx={{ display: "flex" }}>
          <Text_ThaiMonth
            sx={{ flexGrow: 1, ...date_st }}
            value={props.value[0].date}
            showYear
          />
          <Text_Money
            sx={{
              ...date_st,
              color: total < 0 ? "error.light" : "success.light",
            }}
            value={total}
          />
        </Box>
        <Divider color="black" />
        <Label_parameter
          size="18px"
          label="รายรับ"
          value={`+${buff.income}`}
          color_Value="success.main"
          unit="฿"
        />
        <Label_parameter
          size="18px"
          label="รายจ่าย"
          value={buff.expenses}
          color_Value="error.main"
          unit="฿"
        />
      </Box>
      {props.value.map((val, index) => (
        <DailyTotalList value={val} key={index} onClick={(date,value)=>props.onClick?.({...value, date})} />
      ))}
    </Box>
  );
};

export default MonthlyTotalList;
