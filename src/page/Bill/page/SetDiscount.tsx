import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import {
  BillContext,
  BillDefaultState
} from "../context/BillContext";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import MerchList from "../component/MerchList";
import { productInfo_t } from "../../../API/StockService/type";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { useNavigate } from "react-router-dom";
import { productType_e, stockStatus_e } from "../../../enum";

//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
export default function Page_BillSetDiscount() {
  // Hook ************************************
  const [state, setState] = React.useState(BillDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const navigate = useNavigate();
  // Local function **************************
  const onClose = () => {
    navigate("/bill");
  };
  const onSave = () => {
    console.log("save");
  };
  const onAdd = (form: FormAddProduce_t) => {
    const product: productInfo_t = {
      id: form.product?.code || "",
      name: form.product?.value || "",
      price:
        listOption?.find((item) => item.id === form.product?.code)?.price || 0,
      priceAfterDiscount: form.price,
      type: productType_e.merchandise,
      status: stockStatus_e.normal,
      img:
        listOption?.find((item) => item.id === form.product?.code)?.img || "",
    };
    console.log("add", product);
    if (
      product.priceAfterDiscount === undefined ||
      product.price === undefined
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (product.priceAfterDiscount >= product.price) {
      alert("ราคาหลังหักส่วนลดต้องน้อยกว่าราคาปกติ");
      return;
    }
    if (state.merchList?.find((item) => item.id === product.id)) {
      alert("สินค้านี้ถูกเพิ่มแล้ว");
      return;
    }
    const newProduct: productInfo_t = {
      ...product,
      percentDiscount: ((product.price - product.priceAfterDiscount) / product.price) * 100,
    };
    setState({
      ...state,
      merchList: [...(state.merchList || []), newProduct],
    });
  };
  const onDelete = (id: string) => {
    setState({
      ...state,
      merchList: state.merchList?.filter((item) => item.id !== id),
    });
  };
  const onClickProduct = (del: boolean, value: productInfo_t) => {
    if (del) {
      onDelete(value.id);
    } else {
      console.log("view", value);
    }
  };
  // Use Effect ******************************
  React.useEffect(() => {
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
        price: 150,
        amount: 5,
        type: productType_e.merchandise,
        status: stockStatus_e.normal,
        img: "",
      },
    ]);
  }, []);
  // Render **********************************
  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"ตั้งค่าส่วนลด"} onClick={onClose}>
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
        <AddProductForm
          list={listOption}
          hideFieldAmount
          autoComplete
          onAdd={onAdd}
        />
        <MerchList variant="deleteable" onClick={onClickProduct} />
      </Box>
    </BillContext.Provider>
  );
}
