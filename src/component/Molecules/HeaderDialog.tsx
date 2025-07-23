import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  label: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
//*********************************************
// Component
//*********************************************
const HeaderDialog: React.FC<myProps> = (props) => {
  return (
    <>
      <AppBar sx={{ position: "fixed" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={props.onClick}
            aria-label="close"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography sx={{ mx: 1 }} variant="h6" component="div">
            {props.label}
          </Typography>
          {props.children}
        </Toolbar>
      </AppBar>
      <Box sx={{height: "50px"}}/>
    </>
  );
};
export default HeaderDialog;
