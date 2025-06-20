import { Avatar, Box, ListItem, ListItemAvatar } from "@mui/material";
import Label_parameter from "../Atoms/Label_parameter";
import React from "react";
import { UserProfile_t } from "../../API/LoginService/type";
import { RoleString } from "../../function/Enum";

//*********************************************
// Style
//*********************************************

//*********************************************
// Type
//*********************************************
export type userInfo_t = {
  name: string;
  email: string;
  tel: string;
  role: "admin" | "cashier" | "laber";
  enable: boolean;
  img?: string; // Image URL
};
//*********************************************
// Interface
//*********************************************
interface myProps {
  value: UserProfile_t;
}
//*********************************************
// Component
//*********************************************
const UserInfo: React.FC<myProps> = (props) => {
  function stringAvatar(name: string) {
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("");
    return { children: initials };
  }
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar
          {...stringAvatar(props.value.name)}
          alt={props.value.name}
          src={props.value.img}
        />
      </ListItemAvatar>
      <Box>
        <Label_parameter
          label="Name:"
          value={props.value.name}
          weight_Label="600"
          gap="8px"
          size="20px"
        />
        <Label_parameter
          label="Email:"
          value={props.value.email}
          gap="8px"
          color_Value="gray"
        />
        {props.value.tel && (
          <Label_parameter
            label="Phone:"
            value={props.value.tel}
            gap="8px"
            color_Value="gray"
          />
        )}

        <Label_parameter
          label="Role:"
          value={RoleString(props.value.role)}
          gap="8px"
          color_Value="gray"
        />
        <Label_parameter
          label="Status:"
          value={props.value.enable ? "Enable" : "Disable"}
          gap="8px"
          color_Value={props.value.enable ? "green" : "red"}
        />
      </Box>
    </ListItem>
  );
};
export default UserInfo;
