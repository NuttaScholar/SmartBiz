import { Box, Divider, List } from "@mui/material";
import React from "react";
import ContactInfo, { contactInfo_t } from "../Molecules/ContactInfo";
import ButtonOption from "../Molecules/ButtonOption";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const optionList: string[] = ["แก้ไข", "ลบ"];
//*********************************************
// Interface
//*********************************************
interface myProps {
  value: contactInfo_t[];
  onClick?: (codeName: string) => void;
}
//*********************************************
// Component
//*********************************************
const ListContact: React.FC<myProps> = (props) => {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {props.value.map((value, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ContactInfo value={value} onClick={props.onClick} />
            <ButtonOption menuList={optionList} />
          </Box>
          <Divider variant="middle" />
        </React.Fragment>
      ))}
    </List>
  );
};
export default ListContact;
