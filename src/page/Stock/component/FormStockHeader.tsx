import React from "react";
import { Box, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useStockContext } from "../hooks/useStockContex";
import Field from "../../../component/Atoms/Field";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";
import FieldText from "../../../component/Molecules/FieldText";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";

//*********************************************
// Type
//*********************************************

//*********************************************
// Constante
//*********************************************

//*********************************************
// Transition
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  type: "in" | "out";
}
//*********************************************
// Component
//*********************************************
const FormStockHeader: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useStockContext();
  const billImageSource = typeof state.billForm?.img === "string" ? "server" : "local";
  // Local Function *****************
  const onChangeDate = (value: import("dayjs").Dayjs | null) => {
    setState({
      ...state,
      billForm: {
        ...state.billForm,
        date: value?.isValid() ? value.toDate() : undefined,
      },
    });
  };
  const onChangeImage = (file: File | null) => {
    setState({ ...state, billForm: { ...state.billForm, img: file } });
  };
  const onChangeBillImageSource = (
    _event: React.MouseEvent<HTMLElement>,
    source: "local" | "server" | null,
  ) => {
    if (!source || source === billImageSource) return;
    setState({
      ...state,
      billForm: { ...state.billForm, img: source === "server" ? "" : null },
    });
  };
  const onChangeServerFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      billForm: { ...state.billForm, img: event.target.value },
    });
  };
  const onChangeDecs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState({
      ...state,
      billForm: { ...state.billForm, description: value },
    });
  };
  return (
    <Field direction="column">
      <FieldDate
        defaultValue={state.billForm?.date}
        label="วันที่"
        hideField
        onChange={onChangeDate}
      />
      {props.type === "in" ? (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <FieldContactAccess
            hideField
            label="Contact"
            value={state.billForm?.who}
            onChange={(val) =>
              setState({ ...state, billForm: { ...state.billForm, who: val } })
            }
            onClear={() => {
              setState({ ...state, billForm: { ...state.billForm, who: "" } });
            }}
          />
          <Box sx={{ mt: 1 }}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={billImageSource}
              onChange={onChangeBillImageSource}
              aria-label="แหล่งที่มาของ Bill Image"
              sx={{ mb: 1, bgcolor: "white" }}
            >
              <ToggleButton value="local">ไฟล์จากเครื่อง</ToggleButton>
              <ToggleButton value="server">ไฟล์เก่าจาก Server</ToggleButton>
            </ToggleButtonGroup>
            {billImageSource === "local" ? (
              <FieldImage
                label="Bill Image *"
                hideField
                buttonSize={100}
                onChange={onChangeImage}
              />
            ) : (
              <TextField
                required
                fullWidth
                sx={{bgcolor: "white"}}
                label="ชื่อไฟล์ Bill Image บน Server"
                placeholder="ตัวอย่าง: 20260830_ab12cd34"
                value={typeof state.billForm?.img === "string" ? state.billForm.img : ""}
                onChange={onChangeServerFileName}
              />
            )}
          </Box>
        </Box>
      ) : (
        <FieldText
          label="Description"
          placeholder="แจ้งวัตถุประสงค์"
          value={state.billForm?.description || ""}
          required
          hideField
          onChange={onChangeDecs}
        />
      )}
    </Field>
  );
};
export default FormStockHeader;
