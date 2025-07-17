import { Box, Button, DialogContent, Fab } from "@mui/material";
import * as React from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MonthlyTotalList from "../../../component/Molecules/MonthlyTotalList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  access_t,
  AccessContext,
  AccessDefaultState,
  accessDialog_e,
} from "../context/AccessContext";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { TypeSelect } from "../constants/typeSelect";
import FieldSelector from "../../../component/Molecules/FieldSelector";
import FieldText from "../../../component/Molecules/FieldText";
import FieldDuration from "../../../component/Molecules/FieldDuration";
import FieldContact from "../../../component/Molecules/FieldContact";
import { SearchTransForm_t } from "../component/DialogSearchTransaction";
import accessWithRetry_f from "../lib/accessWithRetry";
import { errorCode_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import DialogFormTransaction, { TransitionForm_t } from "../component/DialogFormTransaction";
import DialogContactList from "../component/DialogContactList";
import FieldContactAccess from "../component/FieldContactAccess";

const Page_AccessSearch: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const authContext = useAuth();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<access_t>(AccessDefaultState);
  // Local Function ***********
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());

    const { duration_From, duration_To, ...rest } = formJson;
    const [fday, fmonth, fyear] = duration_From.split("/").map(Number);
    const [tday, tmonth, tyear] = duration_To.split("/").map(Number);
    const form: SearchTransForm_t = {
      from: new Date(fyear, fmonth - 1, fday),
      to: new Date(tyear, tmonth - 1, tday),
      ...rest,
    };
    accessWithRetry_f
      .get(authContext, form)
      .then((res) => {
        if (res.result) {
          setState({ ...state, transaction: res.result });
        } else if (res.errCode) {
          alert(ErrorString(res.errCode));
          if (res.errCode === errorCode_e.TokenExpiredError) {
            navigate("/");
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
      });
  };
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState({
      ...state,
      transitionForm: value,
      fieldContact: value.who,
      open: accessDialog_e.transactionForm,
    });
  };
  // Use Effect **************
  React.useEffect(() => {}, []);
  return (
    <AccessContext.Provider value={{ state, setState }}>
      <HeaderDialog label="ค้นหา" onClick={() => navigate("/access")} />
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
            list={TypeSelect}
          />
          <FieldText icon={<PaidIcon />} name="topic" label="Topic" />
          <FieldDuration
            icon={<CalendarMonthIcon />}
            defaultValue={{ from: new Date(), to: new Date() }}
            name="duration"
          />
          <FieldContactAccess
            name="who"
            icon={<AccountBoxIcon />}
            placeholder="Contact"
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
        {state.transaction?.map((val, index) => (
          <MonthlyTotalList
            key={index}
            value={val.detail}
            onClick={onClickTransHandler}
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
      <DialogFormTransaction/>
      <DialogContactList/>
    </AccessContext.Provider>
  );
};

export default Page_AccessSearch;
