import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material";

//**********************************************
// Style
//**********************************************
const Field: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};
//**********************************************
// Interface
//**********************************************
interface myProps {
  label: string;
  value: string | number;
  color?: string;
  gap?: string;
  width?: string;
  size?: string;
  color_Label?: string;
  color_Value?: string;
  weight_Label?: string;
}
//**********************************************
// Component
//**********************************************
const Label_parameter: React.FC<myProps> = (props) => {
  return (
    <Box
      sx={{
        color: props.color,
        justifyContent:
          props.gap === undefined ? "space-between" : "flex-start",
        gap: props.gap,
        width: props.width,
        ...Field,
      }}
    >
      <Typography sx={{ fontWeight: props.weight_Label||"500", fontSize: props.size, color: props.color_Label }}>
        {props.label}
      </Typography>
      <Typography sx={{ fontSize: props.size, color:props.color_Value }}>{props.value}</Typography>
    </Box>
  );
};

export default Label_parameter;
