import React from "react";
import { SxProps, Theme, Typography } from "@mui/material";

/**************************************************** */
//  Style
/**************************************************** */

/**************************************************** */
//  Interface
/**************************************************** */
interface myProps {
  value: Date;
  showYear?: boolean;
  sx?: SxProps<Theme>;
}
/**************************************************** */
//  Component
/**************************************************** */
const Text_ThaiMonth: React.FC<myProps> = (props) => {
  const thaiMonth = new Intl.DateTimeFormat("th-TH", {
    month: "short",
    ...(props.showYear && { year: "numeric" }),
  }).format(props.value);

  return <Typography sx={props.sx}>{thaiMonth}</Typography>;
};

export default Text_ThaiMonth;
