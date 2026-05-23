import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import { BillContext, BillDefaultState } from "../context/BillContext";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import MerchList from "../component/MerchList";
import { productInfo_t } from "../../../API/StockService/type";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { useNavigate } from "react-router-dom";
import { errorCode_e, productType_e, stockStatus_e } from "../../../enum";
import stockWithRetry_f from "../../Stock/lib/stockWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";
import billWithRetry_f from "../lib/billWithRetry";
import { discountItem_t } from "../../../API/BillService/type";

//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
export default function Page_BillSetDiscount() {
  // Hook ************************************
  const authContext = useAuth();
  const [state, setState] = React.useState(BillDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const navigate = useNavigate();
  const selectedCustomerID = state.billForm?.customer?.trim() || "";
  // Local function **************************
  const onClose = () => {
    navigate("/bill");
  };
  const onSave = () => {
    const merchList = state.merchList || [];

    if (!selectedCustomerID) {
      alert("Please select customer");
      return;
    }

    const discounts: discountItem_t[] = merchList.map((item) => ({
      productID: item.id,
      discountPercent: Number(item.percentDiscount ?? 0),
    }));

    if (
      discounts.some(
        (item) =>
          !item.productID ||
          !Number.isFinite(item.discountPercent) ||
          item.discountPercent < 0 ||
          item.discountPercent > 100,
      )
    ) {
      alert("Please check product discount");
      return;
    }

    setIsSaving(true);
    billWithRetry_f
      .putDiscounts(authContext, { customerID: selectedCustomerID, discounts })
      .then((res) => {
        if (res.status === "success") {
          alert("บันทึกสำเร็จ");
        } else {
          alert(
            `Error: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        alert("Error");
        console.log("putDiscountsError", err);
      })
      .finally(() => {
        setIsSaving(false);
      });
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
      percentDiscount:
        ((product.price - product.priceAfterDiscount) / product.price) * 100,
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
  const toDiscountProduct = (discount: discountItem_t): productInfo_t => {
    const product = listOption.find((item) => item.id === discount.productID);
    const price = product?.price || 0;
    const discountPercent = Number(discount.discountPercent);

    return {
      id: discount.productID,
      name: product?.name || discount.productID,
      price,
      priceAfterDiscount: Number(
        (price - (price * discountPercent) / 100).toFixed(2),
      ),
      percentDiscount: discountPercent,
      type: product?.type || productType_e.merchandise,
      status: product?.status || stockStatus_e.normal,
      img: product?.img || "",
    };
  };
  // Use Effect ******************************
  React.useEffect(() => {
    stockWithRetry_f
      .getStock(authContext, {
        productType: [productType_e.merchandise, productType_e.another],
      })
      .then((res) => {
        if (res.status === "success" && res.result !== undefined) {
          setListOption(res.result);
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        console.log("getStockError", err);
        navigate("/");
      });
  }, []);
  React.useEffect(() => {
    if (!selectedCustomerID) {
      setState((prev) => ({ ...prev, merchList: [] }));
      return;
    }

    let active = true;

    billWithRetry_f
      .getDiscounts(authContext, selectedCustomerID)
      .then((res) => {
        if (!active) return;

        if (res.status === "success" && res.result !== undefined) {
          setState((prev) => ({
            ...prev,
            merchList: res.result?.discounts.map(toDiscountProduct) || [],
          }));
        } else if (res.errCode === errorCode_e.NotFoundError) {
          setState((prev) => ({ ...prev, merchList: [] }));
        } else {
          alert(
            `Error: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        if (!active) return;

        alert("Error");
        console.log("getDiscountsError", err);
      });

    return () => {
      active = false;
    };
  }, [selectedCustomerID, listOption]);
  // Render **********************************
  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"ตั้งค่าส่วนลด"} onClick={onClose}>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={onSave}
            disabled={isSaving}
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
