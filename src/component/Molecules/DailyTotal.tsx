import React from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Text_Money from "../Atoms/Text_Money";
import { SxProps, Theme, Typography } from "@mui/material";

/**************************************************** */
//  Style
/**************************************************** */
const AccordionSummaryBox: SxProps<Theme> = {
  maxWidth: "480px",
  minWidth: "300px",
  width: "100%",
  height: "67px",
  bgcolor: "primary.main",
  color: "primary.contrastText",
  display: "flex",
};
const textp: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 500,
  margin: 0,
  padding: 0,
};
/**************************************************** */
//  Interface
/**************************************************** */
interface myProps {
  day: number;
  money: number;
}
/**************************************************** */
//  Component
/**************************************************** */
const DailyTotal: React.FC<myProps> = (props) => {
  return (
    <AccordionSummary
      sx={AccordionSummaryBox}
      expandIcon={
        <ExpandMoreIcon
          sx={{
            color: "white",
          }}
        />
      }
      aria-controls="panel1-content"
      id="panel1-header"
    >
      <Typography sx={{ ...textp, flexGrow: 1 }}>
        Day: {props.day}
      </Typography>
      <Text_Money sx={textp} value={props.money} />
    </AccordionSummary>
  );
};

export default DailyTotal;
