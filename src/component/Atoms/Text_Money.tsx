import React from "react";
import { SxProps, Theme, Typography } from "@mui/material";

/**************************************************** */
//  Style
/**************************************************** */

/**************************************************** */
//  Interface
/**************************************************** */
export interface myProps {
  value?: number;
  sx?: SxProps<Theme>;
}
/**************************************************** */
//  Component
/**************************************************** */
const Text_Money: React.FC<myProps> = (props) => {
  /* Local Variable */
  const value = props.value || 0;
  /* Local Function */
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  /* Return */
  return (
    <Typography sx={props.sx}>
      {value > 0 && "+"}
      {formatMoney(value)} ฿
    </Typography>
  );
};

export default Text_Money;
