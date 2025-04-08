import React from 'react'
import AccordionDetails from '@mui/material/AccordionDetails';
import Text_Money from '../Atoms/Text_Money';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { transactionType_e } from '../../type';

/**************************************************** */
//  Style
/**************************************************** */
const container: SxProps<Theme> = {
  border: "1px solid",
  padding: "8px 16px 16px 16px",
  cursor: "pointer",
  "&:hover": {
    bgcolor: "grey.200"
  }
};

const title: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "4px",
};

const titlep: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 400,
  margin: 0,
}

const detail: React.CSSProperties = {
  color: "#686868",
  fontStyle: "italic",
}

const detailp: React.CSSProperties = {
  margin: 0,
}

/**************************************************** */
//  Typedef
/**************************************************** */

export type transactionDetail_t = {
  id: number;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
}
/**************************************************** */
//  Interface
/**************************************************** */
interface transactionProp {
  value: transactionDetail_t;
  onClick?: (value: transactionDetail_t) => void;
}

/**************************************************** */
//  Component
/**************************************************** */
const TransactionDetail: React.FC<transactionProp> = (Props) => {
  const titleStyle: React.CSSProperties = {
    ...titlep,
    color: Props.value.type === transactionType_e.income || Props.value.type === transactionType_e.loan ? "green" : "red"
  };

  let amount = Props.value.money;
  if (Props.value.type === transactionType_e.expenses || Props.value.type === transactionType_e.lend) {
    amount *= -1;
  }
  return (
    <AccordionDetails
      sx={{
        padding: "0"
      }}
    >
      <Box
        sx={container}
        onClick={() => Props.onClick?.(Props.value)}
      >
        <Box sx={title}>
          <Typography sx={titlep}>{Props.value.topic}</Typography>
          <Text_Money value={amount} sx={titleStyle} />
        </Box>

        <Box style={detail}>
          <Typography sx={detailp}>{Props.value.description} {(Props.value.who)&&`#${Props.value.who}`}</Typography>
        </Box>
      </Box>
    </AccordionDetails>
  )
}

export default TransactionDetail