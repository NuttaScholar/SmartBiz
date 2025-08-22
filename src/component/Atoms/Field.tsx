import * as React from "react";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material";
import { css_alignItem_t, css_display_t } from "../../type";
//*********************************************
// Style
//*********************************************
const field: SxProps<Theme> = {
  minWidth: "300px",
  width: "100%",
  padding: "8px 16px",
  borderRadius: "8px",
  gap: "8px",
  boxSizing: "border-box",
};
//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
  alignItem?: css_alignItem_t;
  color?: string;
  hide?: boolean;
  display?: css_display_t;
  maxWidth?: string;
}
//*************************************************
// Function
//*************************************************
const Field: React.FC<myProps> = (props) => {
  return (
    <Box
      sx={{
        ...field,
        display: props.display||"flex",
        padding: props.hide ? "0" : "8px 16px",
        bgcolor: props.color || "secondary.main",
        alignItems: props.alignItem,
        maxWidth: props.maxWidth || "480px",
      }}
    >
      {props.children}
    </Box>
  );
};

export default Field;
