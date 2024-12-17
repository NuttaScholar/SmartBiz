import React from 'react'
import { Box, SxProps, Theme, Typography } from "@mui/material";

/**************************************************** */
//  Style
/**************************************************** */
const field: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "space-between",
}

const textp: React.CSSProperties = {
  
  fontSize: "24px",
  fontWeight: 500,
  margin: 0,
  padding: 0,
}
/**************************************************** */
//  Interface
/**************************************************** */
export interface TextMoneyPropS {
  Day: number,
  Money: number
}
/**************************************************** */
//  Component
/**************************************************** */
const Text_Money: React.FC<TextMoneyPropS> = (props) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  return (
    <Box sx={field}>
      <Typography sx={textp}>Day: {props.Day}</Typography>
      <Typography style={textp}>{(props.Money > 0)&& "+"}{formatMoney(props.Money)} ฿</Typography>
    </Box>
  )
}

export default Text_Money