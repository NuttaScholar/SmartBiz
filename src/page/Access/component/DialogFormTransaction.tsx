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
import { TransitionForm_t } from "../../../API/AccountService/type";
import FieldImage from "../../../component/Molecules/FieldImage";

//*********************************************
// Type
//*********************************************

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
  const authContext = useAuth();
  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = state.transitionForm?.date || new Date();
    const newData: TransitionForm_t = {
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      money: state.transitionForm?.money,
      topic: state.transitionForm?.topic,
      type: state.transitionForm?.type,
      description: state.transitionForm?.description || "",
      who: state.fieldContact,
      id: state.transitionForm?.id,
    };
    console.log(newData);
    if (state.transitionForm?.id !== undefined) {
      // Edit
      accessWithRetry_f
        .put(authContext, newData)
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
        .post(authContext, newData)
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
          alert("ไม่สามารถเพิ่มรายการได้");
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
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (state.transitionForm?.readonly) return;
    setState({
      ...state,
      transitionForm: {
        ...state.transitionForm,
        [event.target.name]: event.target.value,
      },
    });
  };
  // Use Effect **************
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
          position="fixed"
        >
          {state.transitionForm && !state.transitionForm.readonly && (
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
            my: "72px",
            gap: "8px",
          }}
        >
          <FieldText
            icon={<PaidIcon />}
            required
            value={state.transitionForm?.money?.toString() || ""}
            label="Amount"
            name="money"
            type="number"
            onChange={(event) => {
              if (state.transitionForm?.readonly) return;
              setState({
                ...state,
                transitionForm: {
                  ...state.transitionForm,
                  money: Number(event.target.value),
                },
              });
            }}
          />
          <FieldSelector
            icon={<SyncAltIcon />}
            required
            value={state.transitionForm?.type?.toString() || ""}
            name="type"
            label="Transaction"
            list={TypeSelect}
            onChange={(val) => {
              if (state.transitionForm?.readonly) return;
              setState({
                ...state,
                transitionForm: {
                  ...state.transitionForm,
                  type: val as transactionType_e,
                },
              });
            }}
          />
          <FieldText
            icon={<PaidIcon />}
            required
            value={state.transitionForm?.topic || ""}
            name="topic"
            label="Topic"
            onChange={onChangeHandler}
          />
          <FieldText
            icon={<SubjectIcon />}
            value={state.transitionForm?.description || ""}
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
            readonly={state.transitionForm?.readonly}
            defaultValue={state.transitionForm?.date || new Date()}
            name="date"
            onChange={(val) =>
              val &&
              setState({
                ...state,
                transitionForm: { ...state.transitionForm, date: val.toDate() },
              })
            }
          />
          <FieldImage
            label="Bill Image"
            buttonSize={100}
            defauleValue={state.transitionForm?.bill}
            onChange={(file) => {
              console.log(file);
            }}
          />
          {!state.transitionForm?.readonly && (
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
          )}
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
