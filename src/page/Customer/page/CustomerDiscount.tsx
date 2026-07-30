import SaveIcon from "@mui/icons-material/Save";
import { Box, IconButton } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { discountItem_t } from "../../../API/BillService/type";
import type { productInfo_t } from "../../../API/StockService/type";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import AddProductForm from "../../../component/Organisms/AddProductForm";
import type { FormAddProduce_t } from "../../../component/Organisms/AddProductForm";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { errorCode_e, productType_e, stockStatus_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import DialogBillEdit from "../../Bill/component/DialogBillEdit";
import MerchList from "../../Bill/component/MerchList";
import {
  BillContext,
  BillDefaultState,
  billDialog_e,
} from "../../Bill/context/BillContext";
import type { billState_t } from "../../Bill/context/BillContext";
import billWithRetry_f from "../../Bill/lib/billWithRetry";
import stockWithRetry_f from "../../Stock/lib/stockWithRetry";

export default function Page_CustomerDiscount() {
  const { customerID = "" } = useParams<{ customerID: string }>();
  const authContext = useAuth();
  const navigate = useNavigate();
  const [state, setState] = React.useState<billState_t>({
    ...BillDefaultState,
    billForm: {
      ...BillDefaultState.billForm,
      customer: customerID,
    },
  });
  const [productOptions, setProductOptions] =
    React.useState<productInfo_t[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const toDiscountProduct = React.useCallback(
    (discount: discountItem_t): productInfo_t => {
      const product = productOptions.find(
        (item) => item.id === discount.productID,
      );
      const price = Number(product?.price ?? 0);
      return {
        id: discount.productID,
        name: product?.name || discount.productID,
        price,
        priceAfterDiscount: Number(
          (price * (1 - discount.discountPercent / 100)).toFixed(2),
        ),
        percentDiscount: discount.discountPercent,
        type: product?.type ?? productType_e.merchandise,
        status: product?.status ?? stockStatus_e.normal,
        img: product?.img ?? "",
      };
    },
    [productOptions],
  );

  React.useEffect(() => {
    if (!customerID) {
      navigate("/customer", { replace: true });
      return;
    }

    let active = true;
    stockWithRetry_f
      .getStock(authContext, {
        productType: [productType_e.merchandise, productType_e.another],
      })
      .then((response) => {
        if (!active) return;
        if (response.success && response.data) {
          setProductOptions(response.data);
        } else {
          throw new Error(response.message || "ไม่สามารถโหลดสินค้าได้");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, error)) return;

        console.error("getStockError", error);
        alert("ไม่สามารถโหลดสินค้าได้");
      });

    return () => {
      active = false;
    };
  }, [authContext, customerID, navigate]);

  React.useEffect(() => {
    if (!customerID) return;

    let active = true;
    billWithRetry_f
      .getDiscounts(authContext, customerID)
      .then((response) => {
        if (!active) return;

        if (response.success && response.data) {
          setState((current) => ({
            ...current,
            billForm: {
              ...current.billForm,
              customer: customerID,
            },
            merchList: response.data?.discounts.map(toDiscountProduct) ?? [],
          }));
        } else if (response.errCode === errorCode_e.NotFoundError) {
          setState((current) => ({
            ...current,
            merchList: [],
          }));
        } else {
          if (redirectToLoginOnAuthError(navigate, response.errCode)) return;

          alert(
            `Error: ${ErrorString(response.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, error)) return;

        console.error("getDiscountsError", error);
        alert("Error: ไม่สามารถโหลดส่วนลดได้");
      });

    return () => {
      active = false;
    };
  }, [
    authContext,
    customerID,
    productOptions.length,
    navigate,
    toDiscountProduct,
  ]);

  async function saveDiscounts() {
    const discounts: discountItem_t[] =
      (state.merchList ?? []).map((item) => ({
        productID: item.id,
        discountPercent: Number(item.percentDiscount ?? 0),
      }));

    if (
      discounts.some(
        (item) =>
          !item.productID
          || !Number.isFinite(item.discountPercent)
          || item.discountPercent < 0
          || item.discountPercent > 100,
      )
    ) {
      alert("กรุณาตรวจสอบส่วนลดสินค้า");
      return;
    }

    setIsSaving(true);
    try {
      const response = await billWithRetry_f.putDiscounts(authContext, {
        customerID,
        discounts,
      });

      if (response.success) {
        alert("บันทึกส่วนลดสำเร็จ");
      } else {
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return;

        alert(
          `Error: ${ErrorString(response.errCode || errorCode_e.UnknownError)}`,
        );
      }
    } catch (error) {
      if (redirectToLoginOnThrownAuthError(navigate, error)) return;

      console.error("putDiscountsError", error);
      alert("Error: ไม่สามารถบันทึกส่วนลดได้");
    } finally {
      setIsSaving(false);
    }
  }

  function addProduct(form: FormAddProduce_t) {
    const product = productOptions.find(
      (item) => item.id === form.product?.code,
    );
    const price = Number(product?.price ?? 0);
    const priceAfterDiscount = Number(form.price);

    if (!product || !Number.isFinite(priceAfterDiscount)) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (priceAfterDiscount < 0 || priceAfterDiscount >= price) {
      alert("ราคาหลังหักส่วนลดต้องน้อยกว่าราคาปกติ");
      return;
    }
    if (state.merchList?.some((item) => item.id === product.id)) {
      alert("สินค้านี้ถูกเพิ่มแล้ว");
      return;
    }

    setState((current) => ({
      ...current,
      merchList: [
        ...(current.merchList ?? []),
        {
          ...product,
          priceAfterDiscount,
          percentDiscount:
            ((price - priceAfterDiscount) / price) * 100,
        },
      ],
    }));
  }

  function handleProductClick(edit: boolean, product: productInfo_t) {
    const index = state.merchList?.findIndex(
      (item) => item.id === product.id,
    );
    if (index === undefined || index < 0) return;

    if (edit) {
      setState((current) => ({
        ...current,
        merchList: current.merchList?.filter(
          (item) => item.id !== product.id,
        ),
      }));
      return;
    }

    setState((current) => ({
      ...current,
      dialogOpen: billDialog_e.editForm,
      indexList: index,
    }));
  }

  function updateProduct(product: productInfo_t) {
    const price = Number(product.price ?? 0);
    const priceAfterDiscount = Number(product.priceAfterDiscount);
    if (
      !Number.isFinite(priceAfterDiscount)
      || priceAfterDiscount < 0
      || priceAfterDiscount >= price
    ) {
      alert("ราคาหลังหักส่วนลดต้องน้อยกว่าราคาปกติ");
      return;
    }

    setState((current) => ({
      ...current,
      dialogOpen: billDialog_e.none,
      merchList: current.merchList?.map((item, index) =>
        index === current.indexList
          ? {
            ...product,
            percentDiscount:
              ((price - priceAfterDiscount) / price) * 100,
          }
          : item
      ),
    }));
  }

  return (
    <BillContext.Provider value={{ state, setState }}>
      <HeaderDialog
        label="ตั้งค่าส่วนลด Storefront"
        onClick={() => navigate("/customer")}
      >
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={saveDiscounts}
            disabled={isSaving}
            size="large"
            sx={{ color: "white" }}
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
          gap: 1,
        }}
      >
        <FieldContactAccess
          label="ลูกค้า"
          value={customerID}
          readonly
        />
        <AddProductForm
          list={productOptions}
          hideFieldAmount
          autoComplete
          onAdd={addProduct}
        />
        <MerchList variant="deleteable" onClick={handleProductClick} />
      </Box>

      <DialogBillEdit
        hideFieldAmount
        priceField="priceAfterDiscount"
        onSubmit={updateProduct}
      />
    </BillContext.Provider>
  );
}
