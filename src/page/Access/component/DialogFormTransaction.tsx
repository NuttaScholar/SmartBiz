import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, IconButton, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FieldText from "../../../component/Molecules/FieldText";
import PaidIcon from "@mui/icons-material/Paid";
import FieldSelector from "../../../component/Molecules/FieldSelector";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { transactionType_e } from "../../../enum";
import SubjectIcon from "@mui/icons-material/Subject";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FieldDate from "../../../component/Molecules/FieldDate";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAccess } from "../hooks/useAccess";
import DialogContactList from "./DialogContactList";
import accessWithRetry_f from "../lib/accessWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { TypeSelect } from "../constants/typeSelect";
import { accessDialog_e } from "../context/AccessContext";
import FieldContactAccess from "./FieldContactAccess";
import { TransitionForm_t } from "../../../API/AccountService/type";

//*********************************************
// Type
//*********************************************
type form_t = {
  date: Date;
  money?: number;
  topic?: string;
  type?: transactionType_e;
  description?: string;
  who?: string;
};
//*********************************************
// Constante
//*********************************************

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

//*********************************************
// Component
//*********************************************
const DialogFormTransaction: React.FC = () => {
  // Hook *********************
  const { state, setState } = useAccess();
  const [form, setForm] = useState<form_t>({date:new Date()})
  const authContext = useAuth();
  // Local Function ***********
  const handleSubmit = () => {
    if (form.money !== undefined && form.topic && form.type !== undefined) {
      const { date, description, money, topic, type, who } = form;
      const data: TransitionForm_t = {
        id: state.transitionForm?.id,
        date: date,
        money: money,
        topic: topic,
        type: type,
        description: description || "",
        who: who || ""
      }
      console.log(data);
      if (state.transitionForm) {
        // Edit
        accessWithRetry_f
          .put(authContext, data)
          .then(() => {
            setState({
              ...state,
              open: accessDialog_e.none,
              transitionForm: undefined,
              fieldContact: undefined,
              refaceTrans: state.refaceTrans + 1,
            });
            console.log(state.refaceTrans);
          })
          .catch((err) => {
            alert("ไม่สามารถแก้ไขรายการได้");
            console.log(err);
          });
      } else {
        // Add
        accessWithRetry_f
          .post(authContext, data)
          .then(() => {
            setState({
              ...state,
              open: accessDialog_e.none,
              transitionForm: undefined,
              fieldContact: undefined,
              refaceTrans: state.refaceTrans + 1,
            });
          })
          .catch((err) => {
            alert("ไม่สามารถแก้ไขรายการได้");
            console.log(err);
          });
      }
    }else{
      alert("ใส่ข้อมูลไม่ครบ")
    }
  };
  const onDel = () => {
    if (state.transitionForm?.id) {
      accessWithRetry_f
        .del(authContext, state.transitionForm.id)
        .then(() => {
          setState({
            ...state,
            open: accessDialog_e.none,
            transitionForm: undefined,
            fieldContact: undefined,
            refaceTrans: state.refaceTrans + 1,
          });
        })
        .catch((err) => {
          alert("ไม่สามารถลบรายการได้");
          console.log(err);
        });
    }
  };
  const onClose = () => {
    setState({
      ...state,
      open: accessDialog_e.none,
      transitionForm: undefined,
    });
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ ...state, transitionForm:{...state.transitionForm, [event.target.name]: event.target.value }});
    };
  useMemo(()=>{
    if(state.transitionForm){

    }
  },[state.transitionForm])
  return (
    <>
      <Dialog
        fullScreen
        open={state.open === accessDialog_e.transactionForm}
        onClose={onClose}
        slots={{
          transition: Transition,
        }}
      >
        <HeaderDialog
          label={state.transitionForm ? "แก้ไขรายการ" : "เพิ่มรายการ"}
          onClick={onClose}
        >
          {state.transitionForm && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                flexGrow: 1,
              }}
            >
              <IconButton color="inherit" onClick={onDel}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </HeaderDialog>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
            my: "72px",
            gap: "8px",
          }}
        >
          <FieldText
            icon={<PaidIcon />}
            required
            value={state.transitionForm?.money?.toString()||""}
            label="Amount"
            name="money"
            type="number"
            onChange={onChangeHandler}
          />
          <FieldSelector
            icon={<SyncAltIcon />}
            required
            value={state.transitionForm?.type?.toString()||""}
            name="type"
            label="Transaction"
            list={TypeSelect}
          />
          <FieldText
            icon={<PaidIcon />}
            required
            value={state.transitionForm?.topic||""}
            name="topic"
            label="Topic"
            onChange={onChangeHandler}
          />
          <FieldText
            icon={<SubjectIcon />}
            value={state.transitionForm?.description||""}
            name="description"
            label="Description"
            multiline
            onChange={onChangeHandler}
          />
          <FieldContactAccess
            icon={<AccountBoxIcon />}
            placeholder="Contact"
            name="who"
            onClear={() => {
              setState({ ...state, fieldContact: "" });
            }}
            value={state.fieldContact}
            onOpenList={(list) => {
              setState({
                ...state,
                open: accessDialog_e.contactList,
                contactList: list,
                contactKey: undefined,
              });
            }}
          />
          <FieldDate
            icon={<CalendarMonthIcon />}
            defaultValue={state.transitionForm?.date||new Date()}
            name="date"
            onChange={(val)=>val&&setForm({...form, date:val.toDate()})}
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "16px",
              my: "32px",
            }}
          >
            <Button variant="contained" type="submit" sx={{ width: "150px" }} onClick={handleSubmit}>
              save
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "150px" }}
              onClick={() =>
                setState({
                  ...state,
                  open: accessDialog_e.none,
                  transitionForm: undefined,
                })
              }
            >
              cancle
            </Button>
          </Box>
        </Box>
      </Dialog>

      <DialogContactList
        open={state.open === accessDialog_e.contactList}
        onClose={() => {
          setState({
            ...state,
            open: accessDialog_e.transactionForm,
            contactKey: undefined,
          });
        }}
        onSelect={(codeName) => {
          setState({
            ...state,
            open: accessDialog_e.transactionForm,
            fieldContact: codeName,
          });
        }}
        onCloseForm={(val) => {
          if (val) {
            setState({
              ...state,
              contactList: val,
              open: accessDialog_e.contactList,
            });
          } else {
            setState({
              ...state,
              open: accessDialog_e.contactList,
              contactInfo: undefined,
            });
          }
        }}
      />
    </>
  );
};
export default DialogFormTransaction;
