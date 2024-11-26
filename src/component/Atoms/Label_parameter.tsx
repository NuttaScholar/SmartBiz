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
}
//**********************************************
// Component
//**********************************************
const Label_parameter: React.FC<myProps> = (props) => {
  return (
    <Box
      sx={{
        color: props.color,
        justifyContent: props.gap===undefined?"space-between":"flex-start", 
        gap: props.gap,  
        width: props.width,     
        ...Field,
      }}
    >
      <Typography sx={{ fontWeight: "500" }}>{props.label}</Typography>
      <Typography>{props.value}</Typography>
    </Box>
  );
};

export default Label_parameter;
