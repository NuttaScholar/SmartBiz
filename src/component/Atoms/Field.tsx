import * as React from "react";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material";
//*********************************************
// Style
//*********************************************
const field: SxProps<Theme> = {
  maxWidth: "480px",
  minWidth: "300px",
  width: "100%",
  padding: "8px 16px",
  borderRadius: "8px",
  gap: "8px",
};
//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
  alignItem?: "center" | "flex-start" | "flex-end" | "stretch" | "baseline";
  color?: string;
  hide?: boolean;
  display?: any;
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
      }}
    >
      {props.children}
    </Box>
  );
};

export default Field;
