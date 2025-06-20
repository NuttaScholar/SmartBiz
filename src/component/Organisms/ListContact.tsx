import { Box, Divider, List } from "@mui/material";
import React from "react";
import ContactInfo, { contactInfo_t } from "../Molecules/ContactInfo";
import ButtonOption, { menuList_t } from "../Molecules/ButtonOption";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const optionList: menuList_t[] = [{text: "แก้ไข"}, {text: "ลบ"}];
//*********************************************
// Interface
//*********************************************
interface myProps {
  list: contactInfo_t[];
  onClick?: (codeName: string) => void;
  onEdit?: (value: contactInfo_t) => void;
  onDel?: (value: contactInfo_t) => void;
}
//*********************************************
// Component
//*********************************************
const ListContact: React.FC<myProps> = (props) => {
  const OptionHandler = (option:menuList_t, value: contactInfo_t) => {
    if(option.text===optionList[0].text){
      props.onEdit?.(value);
    }else if(option.text===optionList[1].text){
      props.onDel?.(value);
    }    
  }
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {props.list.map((value, index) => (
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
            <ButtonOption menuList={optionList} onClick={(data)=>OptionHandler(data, value)}/>
          </Box>
          <Divider variant="middle" />
        </React.Fragment>
      ))}
    </List>
  );
};
export default ListContact;
