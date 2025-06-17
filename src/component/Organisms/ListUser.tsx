import { Box, Divider, List } from "@mui/material";
import React from "react";
import ContactInfo, { contactInfo_t } from "../Molecules/ContactInfo";
import ButtonOption, { menuList_t } from "../Molecules/ButtonOption";
import UserInfo, { userInfo_t } from "../Molecules/UserInfo";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const optionList: menuList_t[] = [{ text: "แก้ไข" }, { text: "ลบ" }];
//*********************************************
// Interface
//*********************************************
interface myProps {
  list: userInfo_t[];
  onEdit?: (value: userInfo_t) => void;
  onDel?: (value: userInfo_t) => void;
}
//*********************************************
// Component
//*********************************************
const ListUser: React.FC<myProps> = (props) => {
  const OptionHandler = (option: menuList_t, value: userInfo_t) => {
    if (option.text === optionList[0].text) {
      props.onEdit?.(value);
    } else if (option.text === optionList[1].text) {
      props.onDel?.(value);
    }
  };
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {props.list.map((value, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <UserInfo value={value} />
            <ButtonOption
              sx={{m:"8px 16px"}}
              icon={<MoreHorizIcon />}
              menuList={optionList}
              onClick={(data) => OptionHandler(data, value)}
            />
          </Box>
          <Divider variant="middle" />
        </React.Fragment>
      ))}
    </List>
  );
};
export default ListUser;
