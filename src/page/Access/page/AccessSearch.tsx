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
import { ErrorString } from "../../../function/Enum";
import DialogFormTransaction from "../component/DialogFormTransaction";
import DialogContactList from "../../../component/Organisms/DialogContactList";
import DialogFormContact from "../../../component/Organisms/DialogFormContact";
import FieldContact from "../../../component/Molecules/FieldContact";
import { GoToTop } from "../../../function/Window";
import { initPage } from "../../../lib/initPage";
import { SearchTransForm_t, TransitionForm_t } from "../../../API/AccountService/type";
import storageWithRetry_f from "../../../lib/storageWithRetry";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

const Page_AccessSearch: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const authContext = useAuth();
  const [state, setState] = React.useState<access_t>(AccessDefaultState);
  const [contact, SetContact] = React.useState<string>("");
  const [form, setForm] = React.useState<SearchTransForm_t>();
  // Local Function ***********
  const searchHandler = React.useCallback((form: SearchTransForm_t) => {
    if (form !== undefined) {
      accessWithRetry_f
        .get(authContext, form)
        .then((res) => {
          if (res.data) {
            setState((prev) => ({ ...prev, transaction: res.data ?? [] }));
          } else if (res.errCode) {
            if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

            alert(ErrorString(res.errCode));
          }
        })
        .catch((err) => {
          if (redirectToLoginOnThrownAuthError(navigate, err)) return;

          console.error("Error fetching transactions:", err);
          alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
        });
    }
  }, [authContext, navigate]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { duration_From, duration_To, ...rest } = formJson;
    const [fday, fmonth, fyear] = duration_From.split("/").map(Number);
    const [tday, tmonth, tyear] = duration_To.split("/").map(Number);
    const data: SearchTransForm_t = {
      from: new Date(fyear, fmonth - 1, fday),
      to: new Date(tyear, tmonth - 1, tday, 23, 59, 59, 999),
      ...rest,
    };
    setForm(data);
    searchHandler(data);
  };
  const onClickTransHandler = async (value: TransitionForm_t) => {
    let data = value;
    if (value.bill) {
      try {
        const spitUrl = value.bill.split("/");
        const res = await storageWithRetry_f.getImg(authContext, {
          Bucket: spitUrl[0],
          Key: spitUrl[1],
        });
        if (!res.success || res.data === undefined) {
          if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

          alert("ไม่สามารถโหลดรูปภาพได้");
        } else {
          data = { ...value, bill: res.data.url };
        }
      } catch (err) {
        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        console.error("Get image error:", err);
        alert("ไม่สามารถโหลดรูปภาพได้");
      }
    }
    setState({
      ...state,
      transitionForm: data,
      fieldContact: value.who,
      open: accessDialog_e.transactionForm,
    });
  };
  // Use Effect **************
  React.useEffect(() => {
    initPage(authContext).catch((err) => {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.error("Error during initPage:", err);
    });
    form && searchHandler(form);
  }, [authContext, form, navigate, searchHandler, state.refaceTrans]);
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
          <FieldContact
            name="who"
            icon={<AccountBoxIcon />}
            placeholder="Contact"
            value={contact}
            onClear={() => SetContact("")}
            onOpenList={() => {
              SetContact("");
              setState({
                ...state,
                open: accessDialog_e.contactListSearch,
                contactList: [],
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
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={GoToTop}
      >
        <KeyboardArrowUpIcon />
      </Fab>
      <DialogFormTransaction />
      <DialogContactList
        open={state.open === accessDialog_e.contactListSearch}
        list={state.contactList}
        onChange={(list) => setState({ ...state, contactList: list })}
        onClose={() => {
          setState({ ...state, open: accessDialog_e.none });
        }}
        onSelect={(codeName) => {
          SetContact(codeName);
          setState({ ...state, open: accessDialog_e.none });
        }}
        onAdd={() =>
          setState({
            ...state,
            open: accessDialog_e.contactFrom,
            contactInfo: undefined,
          })
        }
        onEdit={(val) =>
          setState({
            ...state,
            open: accessDialog_e.contactFrom,
            contactInfo: val,
          })
        }
      />
      <DialogFormContact
        open={state.open === accessDialog_e.contactFrom}
        defaultValue={state.contactInfo}
        onClose={(val) => {
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
