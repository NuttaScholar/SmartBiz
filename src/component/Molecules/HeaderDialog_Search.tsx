import React from "react";
import HeaderDialog from "./HeaderDialog";
import { Box, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FieldSearch from "./FieldSearch";

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
  onBack?: () => void;
  onAdd?: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (keyword: string) => void;
  value?: string;
  label: string;
}
//*********************************************
// Component
//*********************************************
const HeaderDialog_Search: React.FC<myProps> = (props) => {
  return (
    <HeaderDialog label={props.label} onClick={props.onBack}>
      <Box sx={{flexGrow: 1}}>
        <FieldSearch
          display={{ xs: "none", sm: "flex" }}
          fieldHide
          placeholder="Search"
          value={props.value}
          onChange={props.onChange}
          onSubmit={props.onSearch}
        />
      </Box>
      <IconButton size="large" onClick={props.onAdd}>
        <AddIcon sx={{color: "primary.contrastText", fontSize: 30}}/>
      </IconButton>
    </HeaderDialog>
  );
};
export default HeaderDialog_Search;
