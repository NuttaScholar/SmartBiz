import {
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Label_parameter from "../Atoms/Label_parameter";
import React from "react";

//*********************************************
// Style
//*********************************************

//*********************************************
// Type
//*********************************************
export type contactInfo_t = {
  codeName: string;
  billName: string;
  description?: string;
  address?: string;
  vatID?: string;
  tel?: string;
  img?: string;
};
//*********************************************
// Interface
//*********************************************
interface myProps {
  value: contactInfo_t;
}
//*********************************************
// Component
//*********************************************
const ContactInfo: React.FC<myProps> = (props) => {
  /* function stringAvatar(name: string) {
    const nameArray = name.split(' ');
    let initial:string;
    if(nameArray.length>1){
      initial = `${nameArray[0][0]}${nameArray[1][0]}`;
    }else{
      initial = `${nameArray[0][0]}`;
    }
    return {
      children: initial
    };
  }*/
  function stringAvatar(name: string) {
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("");
    return { children: initials };
  }
  return (
    <ListItem  onClick={()=>console.log("ListItem")} sx={{cursor: 'pointer'}} alignItems="flex-start">
      <ListItemAvatar>
        <Avatar
          {...stringAvatar(props.value.codeName)}
          alt={props.value.codeName}
          src={props.value.img}
        />
      </ListItemAvatar>
      <Box>
        <Label_parameter
          label={"Code Name:"}
          value={props.value.codeName}
          weight_Label="600"
          gap="8px"
          size="20px"
        />
        <Label_parameter
          label="Bill Name:"
          value={props.value.billName}
          gap="8px"
          color_Value="gray"
        />
        {props.value.description && (
          <Label_parameter
            label="Description:"
            value={props.value.description}
            gap="8px"
            color_Value="gray"
          />
        )}
        {props.value.address && (
          <Label_parameter
            label="Address:"
            value={props.value.address}
            gap="8px"
            color_Value="gray"
          />
        )}
        {props.value.tel && (
          <Label_parameter
            label="Tel:"
            value={props.value.tel}
            gap="8px"
            color_Value="gray"
          />
        )}
        {props.value.vatID && (
          <Label_parameter
            label="Tel:"
            value={props.value.vatID}
            gap="8px"
            color_Value="gray"
          />
        )}
      </Box>
    </ListItem>
  );
};
export default ContactInfo;
