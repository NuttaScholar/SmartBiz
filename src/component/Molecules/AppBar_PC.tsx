import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

//************************************************
// Type
//************************************************
export type menuList_t = {
  icon?: React.ReactNode;
  text: string;
  path?: string;
};

//*********************************************
// Interface
//*********************************************
interface myProps {
  menuList: menuList_t[];
  value?: number;
}
//*********************************************
// Component
//*********************************************
const AppBar_PC: React.FC<myProps> = ({ menuList, value }) => {
  const page = value !== undefined && value >= 0 && value < menuList.length
    ? menuList[value]
    : undefined;

  return (
    <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center", gap: "4px" }}>
      {page?.icon}
      <Typography variant="h5" noWrap sx={{ fontWeight: 500, color: "secondary.contrastText" }}>
        {page?.text ?? "Page Not Found!"}
      </Typography>
    </Box>
  );
};
export default AppBar_PC;
