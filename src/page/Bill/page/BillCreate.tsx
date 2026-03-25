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
import { useNavigate } from "react-router-dom";


//*********************************************
// Component
//*********************************************
export default function Page_BillCreate() {
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
  const onEdit = (del: boolean, value: productInfo_t) => {
      if (state.merchList !== undefined) {
        const index = state.merchList.findIndex((item) => item.id === value.id);
  
        if (index === undefined || index < 0) return;
        if (del) {
          const newList = [
            ...state.merchList.slice(0, index),
            ...state.merchList.slice(index + 1),
          ];
          setState({ ...state, merchList: newList });
        } else {
          setState({
            ...state,
            dialogOpen: billDialog_e.editForm,
            indexList: index,
          });
        }
      }
    };
  const onAdd = (product: productInfo_t) => {
    const newProduct: productInfo_t = {
      ...product,
      total: (product.price || 0) * (product.amount || 0),
    }
    setState({
      ...state,
      merchList: [...(state.merchList || []), newProduct],
    });
  };
  // Use Effect ******************************

  // Render **********************************
  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"สร้างใบสั่งซื้อ"} onClick={onClose}>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={onSave}
            size="large"
            sx={{
              color: "white",
            }}
          >
            <SaveIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
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
        <FormBillHeader />
        <AddProductForm variant="Bill" hideFieldPrice onAdd={onAdd} />
        <MerchList
          variant="deleteable"
          onClick={onEdit}
        />
      </Box>
    </BillContext.Provider>
  );
};
