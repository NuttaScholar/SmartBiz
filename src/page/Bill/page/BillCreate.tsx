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
import { billStatus_e, errorCode_e, productType_e, stockStatus_e } from "../../../enum";
import SummaryBar from "../../../component/Organisms/SummaryBar";
import DialogBillEdit from "../component/DialogBillEdit";
import { useAuth } from "../../../hooks/useAuth";
import stockWithRetry_f from "../../Stock/lib/stockWithRetry";
import { ErrorString } from "../../../function/Enum";
import billWithRetry_f from "../lib/billWithRetry";
import {
  createOrderForm_t,
  discountItem_t,
  orderInfo_t,
  orderItem_t,
} from "../../../API/BillService/type";

//*********************************************
// Component
//*********************************************
export default function Page_BillCreate() {
  // Hook ************************************
  const authContext = useAuth();
  const [state, setState] = React.useState(BillDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const [customerDiscounts, setCustomerDiscounts] = React.useState<
    discountItem_t[]
  >([]);
  const [total, setTotal] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = React.useState(false);
  const { orderID } = useParams<{ orderID: string }>();
  const navigate = useNavigate();
  const selectedCustomerID = state.billForm?.customer?.trim() || "";
  // Local function **************************
  const setOrderToForm = React.useCallback((order: orderInfo_t) => {
    setState((prev) => ({
      ...prev,
      billForm: {
        ...prev.billForm,
        id: order.id,
        customer: order.customerID,
        date: order.date ? new Date(order.date) : undefined,
      },
      merchList: order.list || [],
    }));
  }, []);

  const onClose = () => {
    if (orderID) {
      navigate(`/bill/detail/${orderID}`);
    } else {
      navigate("/bill");
    }
  };
  const onSave = () => {
    const customerID = state.billForm?.customer?.trim();
    const merchList = state.merchList || [];

    if (!customerID) {
      alert("กรุณาเลือกลูกค้า");
      return;
    }

    if (merchList.length <= 0) {
      alert("กรุณาเพิ่มสินค้าในใบสั่งซื้อ");
      return;
    }

    const items: orderItem_t[] = merchList.map((item) => ({
      productID: item.id,
      quantity: item.amount || 0,
      priceOriginal: item.price || 0,
      priceAfterDiscount: item.priceAfterDiscount ?? item.price ?? 0,
      discountPercent: item.percentDiscount,
    }));

    if (
      items.some(
        (item) =>
          !item.productID ||
          item.quantity <= 0 ||
          item.priceOriginal < 0 ||
          item.priceAfterDiscount < 0,
      )
    ) {
      alert("กรุณาตรวจสอบรายการสินค้าและจำนวนสินค้า");
      return;
    }

    const totalAmount = Number(
      items
        .reduce((sum, item) => sum + item.quantity * item.priceAfterDiscount, 0)
        .toFixed(2),
    );

    const data: createOrderForm_t = {
      customerID,
      status: billStatus_e.PrepareProduct,
      items,
      totalAmount,
    };

    setIsSaving(true);
    const request = orderID
      ? billWithRetry_f.putOrder(authContext, {
          orderID,
          customerID,
          items,
          totalAmount,
        })
      : billWithRetry_f.postOrder(authContext, data);

    request
      .then((res) => {
        if (res.status === "success") {
          navigate(orderID ? `/bill/detail/${orderID}` : "/bill");
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        alert("เกิดข้อผิดพลาด");
        console.log(orderID ? "putOrderError" : "postOrderError", err);
      })
      .finally(() => {
        setIsSaving(false);
      });
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
  const applyDiscount = React.useCallback(
    (product: productInfo_t, discounts: discountItem_t[]) => {
      const stockProduct = listOption.find((item) => item.id === product.id);
      const price = stockProduct?.price ?? product.price ?? 0;
      const discount = discounts.find((item) => item.productID === product.id);
      const amount = product.amount || 0;

      if (!discount) {
        return {
          ...product,
          price,
          priceAfterDiscount: undefined,
          percentDiscount: undefined,
          total: price * amount,
        };
      }

      const discountPercent = Number(discount.discountPercent);
      const priceAfterDiscount = Number(
        (price - (price * discountPercent) / 100).toFixed(2),
      );

      return {
        ...product,
        price,
        priceAfterDiscount,
        percentDiscount: discountPercent,
        total: priceAfterDiscount * amount,
      };
    },
    [listOption],
  );
  const onAdd = (form: FormAddProduce_t) => {
    const selectedProduct = listOption?.find(
      (item) => item.id === form.product?.code,
    );
    const product: productInfo_t = {
      id: form.product?.code || "",
      name: form.product?.value || "",
      price: selectedProduct?.price || 0,
      amount: form.amount,
      type: productType_e.merchandise,
      status: stockStatus_e.normal,
      img: selectedProduct?.img || "",
    };

    const newProduct = applyDiscount(product, customerDiscounts);
    setState({
      ...state,
      merchList: [...(state.merchList || []), newProduct],
    });
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
  }, [authContext, navigate]);

  React.useEffect(() => {
    if (!orderID) return;

    let active = true;
    setIsLoadingOrder(true);

    billWithRetry_f
      .searchOrders(authContext, { orderID })
      .then((res) => {
        if (!active) return;

        if (res.status === "success") {
          const order = res.result?.find((item) => item.id === orderID);

          if (order) {
            setOrderToForm(order);
          } else {
            alert("ไม่พบข้อมูลคำสั่งซื้อ");
            navigate("/bill");
          }
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
          navigate("/bill");
        }
      })
      .catch((err) => {
        if (!active) return;

        alert("เกิดข้อผิดพลาด");
        console.log("getOrderForEditError", err);
        navigate("/bill");
      })
      .finally(() => {
        if (active) {
          setIsLoadingOrder(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authContext, navigate, orderID, setOrderToForm]);

  React.useEffect(() => {
    if (!selectedCustomerID) {
      setCustomerDiscounts([]);
      setState((prev) => ({
        ...prev,
        merchList: prev.merchList?.map((item) => applyDiscount(item, [])),
      }));
      return;
    }

    let active = true;

    billWithRetry_f
      .getDiscounts(authContext, selectedCustomerID)
      .then((res) => {
        if (!active) return;

        if (res.status === "success" && res.result !== undefined) {
          const discounts = res.result.discounts || [];
          setCustomerDiscounts(discounts);
          setState((prev) => ({
            ...prev,
            merchList: prev.merchList?.map((item) =>
              applyDiscount(item, discounts),
            ),
          }));
        } else if (res.errCode === errorCode_e.NotFoundError) {
          setCustomerDiscounts([]);
          setState((prev) => ({
            ...prev,
            merchList: prev.merchList?.map((item) => applyDiscount(item, [])),
          }));
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        if (!active) return;

        alert("เกิดข้อผิดพลาด");
        console.log("getDiscountsError", err);
      });

    return () => {
      active = false;
    };
  }, [authContext, selectedCustomerID, applyDiscount]);
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
            disabled={isSaving || isLoadingOrder}
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
