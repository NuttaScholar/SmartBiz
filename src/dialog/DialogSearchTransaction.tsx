import { Box, Button, Dialog, DialogContent, Fab, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import { statement_t, transactionType_e, TransitionForm_t } from "../type";
import FieldSelector, {
  listSelect_t,
} from "../component/Molecules/FieldSelector";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import PaidIcon from "@mui/icons-material/Paid";
import FieldText from "../component/Molecules/FieldText";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FieldDuration from "../component/Molecules/FieldDuration";
import FieldContact from "../component/Molecules/FieldContact";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import MonthlyTotalList from "../component/Organisms/MonthlyTotalList";
import { contactInfo_t } from "../component/Molecules/ContactInfo";

//*********************************************
// Type
//*********************************************
export type SearchTransForm_t = {
  to: Date;
  from: Date;
  topic?: string;
  type?: transactionType_e;
  who?: string;
};
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
  onSearch?: (data: SearchTransForm_t) => void;
  onClick?: (value: TransitionForm_t) => void;
  contactList?: contactInfo_t[];
  value?: statement_t[];
}
//*********************************************
// Component
//*********************************************
const DialogSearchTransaction: React.FC<myProps> = (props) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const listSelect: listSelect_t[] = [
    { label: "รายรับ", value: transactionType_e.income },
    { label: "รายจ่าย", value: transactionType_e.expenses },
    { label: "เงินกู้", value: transactionType_e.loan },
    { label: "ให้ยืม", value: transactionType_e.lend },
  ];
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    
    const {duration_From, duration_To, ...rest} = formJson;
    const [fday, fmonth, fyear] = duration_From.split("/").map(Number);
    const [tday, tmonth, tyear] = duration_To.split("/").map(Number);
    const form: SearchTransForm_t = {
      from: new Date(fyear, fmonth - 1, fday),
      to: new Date(tyear, tmonth - 1, tday),
      ...rest,
    };

    props.onSearch?.(form);
  };
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <HeaderDialog label="ค้นหา" onClick={props.onClose} />
      <DialogContent
        ref={contentRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          my: "8px",
          gap: "8px",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            maxWidth: "1000px",
            justifyContent: "center",
            my: "8px",
            gap: "8px",
          }}
        >
          <FieldSelector
            name="type"
            icon={<SyncAltIcon />}
            label="Transaction"
            list={listSelect}
          />
          <FieldText icon={<PaidIcon />} name="topic" label="Topic" />
          <FieldDuration
            icon={<CalendarMonthIcon />}
            defaultValue={{ from: new Date(), to: new Date() }}
            name="duration"
          />
          <FieldContact
            name="who"
            icon={<AccountBoxIcon />}
            placeholder="Contact"
            list={props.contactList}
          />
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              type="submit"
              startIcon={<SearchIcon />}
              sx={{ width: "200px", letterSpacing: "2px" }}
            >
              ค้นหา
            </Button>
          </Box>
        </Box>
        {props.value?.map((val, index) => (
          <MonthlyTotalList
            key={index}
            value={val.detail}
            onClick={props.onClick}
          />
        ))}
      </DialogContent>
      <Fab
        size="medium"
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 32 }}
        onClick={scrollToTop}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Dialog>
  );
};

export default DialogSearchTransaction;
