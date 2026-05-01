import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import {
  BillContext,
  BillDefaultState,
  billDialog_e,
} from "../context/BillContext";
import FormBillHeader from "../component/FormBillHeader";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import MerchList from "../component/MerchList";
import { productInfo_t } from "../../../API/StockService/type";
import { useNavigate, useParams } from "react-router-dom";
import { productType_e, stockStatus_e } from "../../../enum";
import SummaryBar from "../../../component/Organisms/SummaryBar";
import DialogBillEdit from "../component/DialogBillEdit";

//*********************************************
// Component
//*********************************************
export default function Page_BillCreate() {
  // Hook ************************************
  const [state, setState] = React.useState(BillDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const [total, setTotal] = React.useState(0);
  const { orderID } = useParams<{ orderID: string }>();
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
  const onAdd = (form: FormAddProduce_t) => {
    const product: productInfo_t = {
      id: form.product?.code || "",
      name: form.product?.value || "",
      price:
        listOption?.find((item) => item.id === form.product?.code)?.price || 0,
      amount: form.amount,
      type: productType_e.merchandise,
      status: stockStatus_e.normal,
      img:
        listOption?.find((item) => item.id === form.product?.code)?.img || "",
      priceAfterDiscount:
        listOption?.find((item) => item.id === form.product?.code)
          ?.priceAfterDiscount || undefined,
    };
    const newProduct: productInfo_t = {
      ...product,
      total:
        product.priceAfterDiscount === undefined
          ? (product.price || 0) * (product.amount || 0)
          : product.priceAfterDiscount * (product.amount || 0),
    };
    setState({
      ...state,
      merchList: [...(state.merchList || []), newProduct],
    });
  };
  // Use Effect ******************************
  React.useEffect(() => {
    console.log("orderID", orderID);
    setListOption([
      {
        id: "P001",
        name: "Product 1",
        price: 100,
        amount: 10,
        type: productType_e.merchandise,
        status: stockStatus_e.normal,
        img: "",
      },
      {
        id: "P002",
        name: "Product 2",
        price: 200,
        amount: 5,
        type: productType_e.merchandise,
        status: stockStatus_e.normal,
        img: "",
        priceAfterDiscount: 150,
      },
    ]);
  }, []);
  React.useEffect(() => {
    const newTotal = state.merchList?.reduce((sum, item) => {
      return sum + (item.total || 0);
    }, 0);
    setTotal(newTotal || 0);
  }, [state.merchList]);

  // Render **********************************
  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog label={orderID?"แก้ไขใบสั่งซื้อ":"สร้างใบสั่งซื้อ"} onClick={onClose}>
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
        <AddProductForm list={listOption} hideFieldPrice onAdd={onAdd} />
        <MerchList variant="deleteable" onClick={onEdit} />
        <SummaryBar value={total || 0} />
      </Box>
      <DialogBillEdit hideFieldPrice />
    </BillContext.Provider>
  );
}
