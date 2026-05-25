import React from "react";
import { Box, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate, useParams } from "react-router-dom";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import SummaryBar from "../../../component/Organisms/SummaryBar";
import { productInfo_t } from "../../../API/StockService/type";
import {
  createOrderForm_t,
  discountItem_t,
  orderInfo_t,
  orderItem_t,
} from "../../../API/BillService/type";
import {
  billStatus_e,
  errorCode_e,
  productType_e,
  stockStatus_e,
} from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import stockWithRetry_f from "../../Stock/lib/stockWithRetry";
import billWithRetry_f from "../lib/billWithRetry";
import {
  BillContext,
  BillDefaultState,
  billDialog_e,
} from "../context/BillContext";
import FormBillHeader from "../component/FormBillHeader";
import MerchList from "../component/MerchList";
import DialogBillEdit from "../component/DialogBillEdit";

//*************************************************
// Helper functions
//*************************************************
function toErrorMessage(errCode?: errorCode_e) {
  return `เกิดข้อผิดพลาด: ${ErrorString(errCode || errorCode_e.UnknownError)}`;
}

function toOrderAmountMap(order: orderInfo_t) {
  const amountMap = new Map<string, number>();

  order.list?.forEach((item) => {
    amountMap.set(item.id, (amountMap.get(item.id) || 0) + (item.amount || 0));
  });

  return amountMap;
}

function toOrderItems(merchList: productInfo_t[]): orderItem_t[] {
  return merchList.map((item) => ({
    productID: item.id,
    quantity: item.amount || 0,
    priceOriginal: item.price || 0,
    priceAfterDiscount: item.priceAfterDiscount ?? item.price ?? 0,
    discountPercent: item.percentDiscount,
  }));
}

function isInvalidOrderItem(item: orderItem_t) {
  return (
    !item.productID ||
    item.quantity <= 0 ||
    item.priceOriginal < 0 ||
    item.priceAfterDiscount < 0
  );
}

function toTotalAmount(items: orderItem_t[]) {
  return Number(
    items
      .reduce((sum, item) => sum + item.quantity * item.priceAfterDiscount, 0)
      .toFixed(2),
  );
}

function getProductListAmount(
  merchList: productInfo_t[] | undefined,
  productID: string,
  excludeIndex?: number,
) {
  return (
    merchList
      ?.filter((item, index) => item.id === productID && index !== excludeIndex)
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  );
}

function getMaxEditableAmount(
  stockProduct: productInfo_t,
  productID: string,
  orderID: string | undefined,
  originalOrderAmountMap: Map<string, number>,
) {
  return (
    (stockProduct.amount || 0) +
    (orderID ? originalOrderAmountMap.get(productID) || 0 : 0)
  );
}

function shouldLimitStock(product: productInfo_t) {
  return product.type !== productType_e.another;
}

function createMerchProduct(
  stockProduct: productInfo_t,
  amount: number,
): productInfo_t {
  return {
    id: stockProduct.id,
    name: stockProduct.name,
    price: stockProduct.price || 0,
    amount,
    type: stockProduct.type,
    status: stockProduct.status ?? stockStatus_e.normal,
    img: stockProduct.img || "",
  };
}

//*************************************************
// Component
//*************************************************
export default function Page_BillCreate() {
  // Hooks ************************************
  const authContext = useAuth();
  const navigate = useNavigate();
  const { orderID } = useParams<{ orderID: string }>();
  const [state, setState] = React.useState(BillDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const [customerDiscounts, setCustomerDiscounts] = React.useState<
    discountItem_t[]
  >([]);
  const [total, setTotal] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = React.useState(false);
  const [originalOrderAmountMap, setOriginalOrderAmountMap] = React.useState<
    Map<string, number>
  >(new Map());

  // Local variables **************************
  const selectedCustomerID = state.billForm?.customer?.trim() || "";

  // Data mappers *****************************
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

  const setOrderToForm = React.useCallback((order: orderInfo_t) => {
    setOriginalOrderAmountMap(toOrderAmountMap(order));
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

  // UI handlers ******************************
  const onClose = React.useCallback(() => {
    navigate(orderID ? `/bill/detail/${orderID}` : "/bill");
  }, [navigate, orderID]);

  const onEdit = React.useCallback(
    (del: boolean, value: productInfo_t) => {
      const index = state.merchList?.findIndex((item) => item.id === value.id);
      if (index === undefined || index < 0) return;

      if (del) {
        setState((prev) => ({
          ...prev,
          merchList: [
            ...(prev.merchList || []).slice(0, index),
            ...(prev.merchList || []).slice(index + 1),
          ],
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        dialogOpen: billDialog_e.editForm,
        indexList: index,
      }));
    },
    [state.merchList],
  );

  // Product handlers *************************
  const onAdd = React.useCallback(
    (form: FormAddProduce_t) => {
      const selectedProduct = listOption.find(
        (item) => item.id === form.product?.code,
      );

      if (!selectedProduct) {
        alert("ไม่พบข้อมูลสินค้า");
        return;
      }

      if (!form.amount || form.amount <= 0) {
        alert("กรุณากรอกจำนวนสินค้าให้ถูกต้อง");
        return;
      }

      const availableAmount = shouldLimitStock(selectedProduct)
        ? selectedProduct.amount || 0
        : Number.POSITIVE_INFINITY;
      const requestedAmount =
        getProductListAmount(state.merchList, selectedProduct.id) + form.amount;

      if (requestedAmount > availableAmount) {
        alert(
          `จำนวนสินค้าไม่เพียงพอ\n${selectedProduct.name} มีคงเหลือ ${availableAmount} ชิ้น`,
        );
        return;
      }

      const product = createMerchProduct(selectedProduct, form.amount);
      const newProduct = applyDiscount(product, customerDiscounts);
      setState((prev) => ({
        ...prev,
        merchList: [...(prev.merchList || []), newProduct],
      }));
    },
    [applyDiscount, customerDiscounts, listOption, state.merchList],
  );

  const onSubmitEdit = React.useCallback(
    (data: productInfo_t) => {
      const selectedProduct = listOption.find((item) => item.id === data.id);
      if (!selectedProduct) {
        alert("ไม่พบข้อมูลสินค้า");
        return;
      }

      if (!data.amount || data.amount <= 0) {
        alert("กรุณากรอกจำนวนสินค้าให้ถูกต้อง");
        return;
      }

      const availableAmount = shouldLimitStock(selectedProduct)
        ? getMaxEditableAmount(
            selectedProduct,
            data.id,
            orderID,
            originalOrderAmountMap,
          )
        : Number.POSITIVE_INFINITY;
      const requestedAmount =
        getProductListAmount(state.merchList, data.id, state.indexList) +
        data.amount;

      if (requestedAmount > availableAmount) {
        alert(
          `จำนวนสินค้าไม่เพียงพอ\n${selectedProduct.name} สามารถใส่ได้สูงสุด ${availableAmount} ชิ้น`,
        );
        return;
      }

      setState((prev) => ({
        ...prev,
        dialogOpen: billDialog_e.none,
        merchList: prev.merchList?.map((item, index) =>
          index === prev.indexList ? data : item,
        ),
      }));
    },
    [
      listOption,
      orderID,
      originalOrderAmountMap,
      state.indexList,
      state.merchList,
    ],
  );

  // API handlers *****************************
  const onSave = React.useCallback(async () => {
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

    const items = toOrderItems(merchList);
    if (items.some(isInvalidOrderItem)) {
      alert("กรุณาตรวจสอบรายการสินค้าและจำนวนสินค้า");
      return;
    }

    const totalAmount = toTotalAmount(items);
    const data: createOrderForm_t = {
      customerID,
      status: billStatus_e.PrepareProduct,
      items,
      totalAmount,
    };

    setIsSaving(true);
    try {
      const res = orderID
        ? await billWithRetry_f.putOrder(authContext, {
            orderID,
            customerID,
            items,
            totalAmount,
          })
        : await billWithRetry_f.postOrder(authContext, data);

      if (res.status === "success") {
        navigate(orderID ? `/bill/detail/${orderID}` : "/bill");
        return;
      }

      alert(toErrorMessage(res.errCode));
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
      console.log(orderID ? "putOrderError" : "postOrderError", err);
    } finally {
      setIsSaving(false);
    }
  }, [
    authContext,
    navigate,
    orderID,
    state.billForm?.customer,
    state.merchList,
  ]);

  // Effects **********************************
  React.useEffect(() => {
    stockWithRetry_f
      .getStock(authContext, {
        productType: [productType_e.merchandise, productType_e.another],
      })
      .then((res) => {
        if (res.status === "success" && res.result !== undefined) {
          setListOption(res.result);
        } else {
          alert(toErrorMessage(res.errCode));
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
          alert(toErrorMessage(res.errCode));
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
          alert(toErrorMessage(res.errCode));
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
      <HeaderDialog
        label={orderID ? "แก้ไขใบสั่งซื้อ" : "สร้างใบสั่งซื้อ"}
        onClick={onClose}
      >
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={onSave}
            disabled={isSaving || isLoadingOrder}
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
          gap: "8px",
        }}
      >
        <FormBillHeader />
        <AddProductForm list={listOption} hideFieldPrice onAdd={onAdd} />
        <MerchList variant="deleteable" onClick={onEdit} />
        <SummaryBar value={total || 0} />
      </Box>
      <DialogBillEdit hideFieldPrice onSubmit={onSubmitEdit} />
    </BillContext.Provider>
  );
}
