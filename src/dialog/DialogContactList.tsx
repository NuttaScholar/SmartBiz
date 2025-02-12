import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import FieldSearch from "../component/Molecules/FieldSearch";
import HeaderContactList from "../component/Organisms/HeaderContactList";
import ListContact from "../component/Organisms/ListContact";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import { TransitionProps } from "@mui/material/transitions";
import { contactInfo_t } from "../component/Molecules/ContactInfo";

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
      TransitionComponent={Transition}
    >
      <HeaderContactList
        onBack={props.onClose}
        onChange={onChangeHandler}
        onSearch={props.onSearch}
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
      <ListContact list={props.list||[]} onClick={props.onSelect}/>
    </Dialog>
  );
};
export default DialogContactList;
