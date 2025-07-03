import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import FieldSearch from "../Molecules/FieldSearch";
import HeaderContactList from "../Molecules/HeaderDialog_Search";
import ListContact from "./ListContact";
import { TransitionProps } from "@mui/material/transitions";
import { contactInfo_t } from "../Molecules/ContactInfo";

//*********************************************
// Style
//*********************************************

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  onClose?: () => void;
  onSearch?: (keyword: string) => void;
  onSelect?: (codeName: string) => void;
  onAdd?: () => void;
  onEdit?: (val: contactInfo_t) => void;
  onDel?: (val: contactInfo_t) => void;
  list?: contactInfo_t[];
}
//*********************************************
// Component
//*********************************************
const DialogContactList: React.FC<myProps> = (props) => {
  const [key, setKey] = React.useState("");

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderContactList
        label="รายชื่อผู้ติดต่อ"
        onBack={props.onClose}
        onChange={onChangeHandler}
        onSearch={props.onSearch}
        onAdd={props.onAdd}
        value={key}
      />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <FieldSearch
          label="Search"
          display={{ xs: "flex", sm: "none" }}
          value={key}
          onChange={onChangeHandler}
          onSubmit={props.onSearch}
        />
      </Box>
      <ListContact
        list={props.list || []}
        onClick={props.onSelect}
        onDel={props.onDel}
        onEdit={props.onEdit}
      />
    </Dialog>
  );
};
export default DialogContactList;
