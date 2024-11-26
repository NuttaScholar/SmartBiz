import * as React from "react";
import Box from "@mui/material/Box";
//*********************************************
// Style
//*********************************************
const field: React.CSSProperties = {
  display: "flex",
  backgroundColor: "#E0EFFF",
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
  alignItem?: "center"|"flex-start"|"flex-end"|"stretch"|"baseline";
}
//*************************************************
// Function
//*************************************************
const Field: React.FC<myProps> = (props) => {
  return (
    <Box sx={{...field, alignItems: props.alignItem}}>
      {props.children}
    </Box>
  );
};

export default Field;
