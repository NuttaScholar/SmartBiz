import { Box, Dialog, IconButton, Slide } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import { useBillContext } from "../hooks/useBillContex";
import { BillContext, BillDefaultState, billDialog_e } from "../context/BillContext";
import FormBillHeader from "../component/FormBillHeader";
import AddProductForm from "../../../component/Organisms/AddProductForm";
import MerchList from "../component/MerchList";
import { productInfo_t } from "../../../API/StockService/type";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { useNavigate } from "react-router-dom";

//*********************************************
// Interface
//*********************************************
interface myProps {}
//*********************************************
// Component
//*********************************************
export default function Page_BillSetDiscount() {
  // Hook ************************************
  const [state, setState] = React.useState(BillDefaultState);
  const navigate = useNavigate();
  // Local function **************************
  const onClose = () => {
    navigate("/bill");
  };
  const onSave = () => {
    console.log("save");
  };
  const onAdd = (product: productInfo_t) => {
    console.log("add",product);
    setState({
      ...state,
      merchList: [...(state.merchList || []), product],
    });
  };
  // Use Effect ******************************

  // Render **********************************
  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"ตั้งค่าส่วนลด"} onClick={onClose} />
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
        <FieldContactAccess
          placeholder="Contact"
          value={state.billForm?.customer || ""}
          onChange={(val) =>
            setState({
              ...state,
              billForm: { ...state.billForm, customer: val },
            })
          }
          onClear={() => {
            setState({
              ...state,
              billForm: { ...state.billForm, customer: "" },
            });
          }}
        />
        <AddProductForm variant="Bill" hideFieldAmount onAdd={onAdd} />
        <MerchList
          variant="deleteable"
          onClick={(edit, val) => {
            console.log("edit", edit);
          }}
        />
      </Box>
    </BillContext.Provider>
  );
}
