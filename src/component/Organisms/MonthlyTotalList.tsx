import React, { useEffect, useMemo } from "react";
import { Box, Divider, SxProps, Theme } from "@mui/material";
import Text_ThaiMonth from "../Atoms/Text_ThaiMonth";
import Text_Money from "../Atoms/Text_Money";
import DailyTotalList, { DailyTotal_t } from "../Molecules/DailyTotalList";
import Label_parameter from "../Atoms/Label_parameter";
import { TransitionForm_t } from "../../API/AccountService/type";
import { sumDailyTotal, sumTrans_t } from "../../lib/calculate";

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
  expanded?: boolean;
}
/**************************************************** */
//  Component
/**************************************************** */
const MonthlyTotalList: React.FC<myProps> = (props) => {
  const [expanded, setExpanded] = React.useState<boolean[]>(
    props.value.map(() => true)
  );
  const buff = useMemo(() => {
    return props.value.reduce(
      (sum, item) => {
        const val = sumDailyTotal(item);

        return {
          expenses: sum.expenses + val.expenses,
          income: sum.income + val.income,
          total: sum.total + val.total,
        } as sumTrans_t;
      },
      { total: 0, income: 0, expenses: 0 } as sumTrans_t
    );
  }, [props.value]);

  const total = buff.income - buff.expenses;
  useEffect(() => {
    setExpanded(props.value.map(() => props.expanded===undefined?true: props.expanded));
  }, [props.expanded, props.value]);
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
        <DailyTotalList
          expanded={expanded[index]===undefined?true:expanded[index]}
          value={val}
          key={index}
          onClick={(date, value) => props.onClick?.({ ...value, date })}
          onExpanded={(_, isExpanded) => {
            const newExpanded = [...expanded];
            newExpanded[index] = isExpanded;
            setExpanded(newExpanded);
          }}
        />
      ))}
    </Box>
  );
};

export default MonthlyTotalList;
