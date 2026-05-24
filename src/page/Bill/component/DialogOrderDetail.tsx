import { Box, IconButton, Typography } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import React from "react";
import CardProduct, {
  productType_e,
} from "../../../component/Organisms/CardProduct";
import CardOrder from "../../../component/Organisms/CardOrder";
import { orderInfo_t } from "../../../API/BillService/type";
import { errorCode_e, stockStatus_e } from "../../../enum";
import Field from "../../../component/Atoms/Field";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";
import { useNavigate, useParams } from "react-router-dom";

//*********************************************
// Component
//*********************************************
const Page_OrderDetail: React.FC = () => {
  const authContext = useAuth();
  const navigate = useNavigate();
  const { orderID } = useParams<{ orderID: string }>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [order, setOrder] = React.useState<orderInfo_t>();
  const [isLoading, setIsLoading] = React.useState(true);

  const menuList = React.useMemo<menuList_t[]>(
    () => [
      { text: "Print", icon: <PrintIcon /> },
      {
        text: "Edit",
        icon: <EditIcon />,
        path: orderID ? `/bill/edit/${orderID}` : undefined,
      },
      { text: "Delete", icon: <DeleteIcon /> },
      { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
    ],
    [orderID],
  );

  const onClose = () => {
    navigate("/bill");
  };

  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        if (orderID) {
          window.open(`/bill/preview/${orderID}`, "_blank");
        }
        break;
      case 2:
        if (!orderID) return;
        billWithRetry_f
          .delOrder(authContext, orderID)
          .then((res) => {
            if (res.status === "success") {
              navigate("/bill");
            } else {
              alert(
                `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
              );
            }
          })
          .catch((err) => {
            alert("เกิดข้อผิดพลาด");
            console.log("delOrderError", err);
          });
        break;
      case 3:
        containerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        break;
    }
  };

  React.useEffect(() => {
    if (!orderID) {
      setIsLoading(false);
      setOrder(undefined);
      return;
    }

    let active = true;
    setIsLoading(true);

    billWithRetry_f
      .searchOrders(authContext, { orderID })
      .then((res) => {
        if (!active) return;

        if (res.status === "success") {
          setOrder(res.result?.find((item) => item.id === orderID));
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
          setOrder(undefined);
        }
      })
      .catch((err) => {
        if (!active) return;

        alert("เกิดข้อผิดพลาด");
        console.log("getOrderDetailError", err);
        setOrder(undefined);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authContext, orderID]);

  return (
    <>
      <HeaderDialog label="รายละเอียด" onClick={onClose}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <IconButton color="inherit">
            <SendIcon />
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          mt: "72px",
          gap: "8px",
        }}
      >
        {isLoading && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            Loading...
          </Typography>
        )}
        {!isLoading && !order && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            ไม่พบข้อมูลคำสั่งซื้อ
          </Typography>
        )}
        {order && <CardOrder maxWidth="400px" value={{ ...order, list: [] }} />}
        {order && (
          <Field maxWidth="1280px" direction="column" alignItem="center">
            <Typography variant="h6">รายการสินค้า</Typography>
          </Field>
        )}
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "1280px",
            height: "calc(100vh - 127px)",
            overflowY: "auto",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              gap: 1,
            }}
          >
            {order?.list.map((item, index) => (
              <CardProduct
                key={index}
                maxWidth="400px"
                value={{
                  id: item.id,
                  img: item.img,
                  name: item.name,
                  status: stockStatus_e.normal,
                  type: item.type ?? productType_e.merchandise,
                  price: item.price,
                  description: item.description,
                  amount: item.amount,
                  total: item.total,
                  percentDiscount: item.percentDiscount,
                  priceAfterDiscount: item.percentDiscount
                    ? item.priceAfterDiscount
                    : undefined,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
      {order && (
        <MySpeedDial
          menuList={menuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}
    </>
  );
};

export default Page_OrderDetail;
