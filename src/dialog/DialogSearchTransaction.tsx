import { Box, Button, Dialog, DialogContent, Fab, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import { transactionType_e } from "../type";
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
import { DailyMoneyList } from "../dataSet/DataMoney";
import { DailyTotal_t } from "../component/Molecules/DailyTotalList";

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
type form_t = {};
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
  onSubmit?: (data: SearchTransForm_t) => void;
}
//*********************************************
// Component
//*********************************************
const DialogSearchTransaction: React.FC<myProps> = (props) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [transaction, setTransaction] =
    React.useState<DailyTotal_t[]>(DailyMoneyList);
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
    const form = formJson;
    console.log(form);
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
            list={ContactList_dataSet}
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
        {transaction.length !== 0 && <MonthlyTotalList value={transaction} />}
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
