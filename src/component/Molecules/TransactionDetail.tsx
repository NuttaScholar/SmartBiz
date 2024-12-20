import React, { useState } from 'react'
import AccordionDetails from '@mui/material/AccordionDetails';

/**************************************************** */
//  Style
/**************************************************** */
const container: React.CSSProperties = {
  border: "1px solid",
  padding: "8px 16px 16px 16px",
};

const elementHover: React.CSSProperties = {
  ...container,
  cursor: "pointer",
  background: "#E8E8E8"
}

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

/**************************************************** */
//  Interface
/**************************************************** */
export interface transactionProp {
  id: string;
  money: number;
  Income: boolean;
  name: string|null;
  description: string|null;
  onClick?: (id: string) => void;
}

/**************************************************** */
//  Component
/**************************************************** */
const TransactionDetail: React.FC<transactionProp> = (Props) => {
  const [hover, setHover] = useState(false);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const titleStyle: React.CSSProperties = {
    ...titlep,
    color: Props.Income ? "green" : "red"
  };

  return (
    <AccordionDetails
      sx={{
        padding: "0"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div 
        style={hover ? elementHover : container}
        onClick={() => Props.onClick?.(Props.id)}
      >
        <div style={title}>
          <p style={titlep}>{Props.name}</p>
          <p style={titleStyle}>{Props.Income === true ? (
            <>+</>
          ):(
            <>-</>
          )} {formatMoney(Props.money)}</p>
        </div>

        <div style={detail}>
          <p style={detailp}>{Props.description}</p>
        </div>
      </div>
    </AccordionDetails>
  )
}

export default TransactionDetail