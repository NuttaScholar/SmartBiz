import { Box, Button, Fab } from "@mui/material";
import * as React from "react";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MonthlyTotalList from "../../../component/Organisms/MonthlyTotalList";
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
import accessWithRetry_f from "../lib/accessWithRetry";
import { errorCode_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import DialogFormTransaction from "../component/DialogFormTransaction";
import DialogContactList from "../component/DialogContactList";
import FieldContactAccess from "../component/FieldContactAccess";
import { GoToTop } from "../../../function/Window";
import { initPage } from "../../../lib/initPage";
import { SearchTransForm_t, TransitionForm_t } from "../../../API/AccountService/type";

const Page_AccessSearch: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const authContext = useAuth();
  const [state, setState] = React.useState<access_t>(AccessDefaultState);
  const [contact, SetContact] = React.useState<string>("");
  const [form, setForm] = React.useState<SearchTransForm_t>();
  // Local Function ***********
  const searchHandler = (form: SearchTransForm_t) => {
    if (form !== undefined) {
      accessWithRetry_f
        .get(authContext, form)
        .then((res) => {
          if (res.result) {
            console.log("Search Result:", res.result);
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
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit");
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());

    const { duration_From, duration_To, ...rest } = formJson;
    const [fday, fmonth, fyear] = duration_From.split("/").map(Number);
    const [tday, tmonth, tyear] = duration_To.split("/").map(Number);
    const data: SearchTransForm_t = {
      from: new Date(fyear, fmonth - 1, fday),
      to: new Date(tyear, tmonth - 1, tday),
      ...rest,
    };
    console.log("Search Data:", data);
    setForm(data);
    searchHandler(data);
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
  React.useEffect(() => {
    initPage(authContext);
    form && searchHandler(form);
  }, [state.refaceTrans]);
  return (
    <AccessContext.Provider value={{ state, setState }}>
      <HeaderDialog label="ค้นหา" onClick={() => navigate("/access")} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          my: {xs:"64px", md: "72px"},
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
            value={contact}
            onClear={() => SetContact("")}
            onOpenList={(list) => {
              SetContact("");
              setState({
                ...state,
                open: accessDialog_e.contactListSearch,
                contactList: list,
              });
            }}
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
      </Box>
      <Fab
        size="medium"
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 32 }}
        onClick={GoToTop}
      >
        <KeyboardArrowUpIcon />
      </Fab>
      <DialogFormTransaction />
      <DialogContactList
        open={state.open === accessDialog_e.contactListSearch}
        onClose={() => {
          setState({ ...state, open: accessDialog_e.none });
        }}
        onSelect={(codeName) => {
          SetContact(codeName);
          setState({ ...state, open: accessDialog_e.none });
        }}
        onCloseForm={(val) => {
          if (val) {
            setState({
              ...state,
              contactList: val,
              open: accessDialog_e.contactListSearch,
            });
          } else {
            setState({
              ...state,
              open: accessDialog_e.contactListSearch,
              contactInfo: undefined,
            });
          }
        }}
      />
    </AccessContext.Provider>
  );
};

export default Page_AccessSearch;
