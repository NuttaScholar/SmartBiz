import React from "react";
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

//*********************************************
// Type
//*********************************************
export type TransitionForm_t = {
  id?: string;
  date: Date;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
};
type form_t = {
  date: string;
  topic: string;
  type: string;
  money: string;
  who: string;
  description: string;
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

//*********************************************
// Component
//*********************************************
const DialogFormTransaction: React.FC = () => {
  // Hook *********************
  const { state, setState } = useAccess();
  const authContext = useAuth();
  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const form = formJson as form_t;
    const [day, month, year] = form.date.split("/").map(Number);
    const data: TransitionForm_t = {
      id: state.transitionForm?.id,
      date: new Date(year, month - 1, day),
      topic: form.topic,
      type: Number(form.type),
      money: Number(form.money),
      description:
        form.description === ""
          ? state.transitionForm?.description
            ? ""
            : undefined
          : form.description,
      who:
        form.who === ""
          ? state.transitionForm?.who
            ? ""
            : undefined
          : form.who,
    };
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
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
            my: "8px",
            gap: "8px",
          }}
        >
          <FieldText
            icon={<PaidIcon />}
            required
            defauleValue={state.transitionForm?.money.toString()}
            label="Amount"
            name="money"
            type="number"
          />
          <FieldSelector
            icon={<SyncAltIcon />}
            required
            defauleValue={state.transitionForm?.type.toString()}
            name="type"
            label="Transaction"
            list={TypeSelect}
          />
          <FieldText
            icon={<PaidIcon />}
            required
            defauleValue={state.transitionForm?.topic}
            name="topic"
            label="Topic"
          />
          <FieldText
            icon={<SubjectIcon />}
            defauleValue={state.transitionForm?.description}
            name="description"
            label="Description"
            multiline
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
            defaultValue={state.transitionForm?.date || new Date()}
            name="date"
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
            <Button variant="contained" type="submit" sx={{ width: "150px" }}>
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
