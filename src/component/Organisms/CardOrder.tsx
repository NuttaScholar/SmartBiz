import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import React from "react";
import errImg from "../../assets/NoImage.jpg";
import { orderInfo_t } from "../../API/BillService/type";
import { billStatus_e, orderSource_e } from "../../enum";
import { BillStatusString } from "../../function/Enum";
/**************************************************** */
//  Type
/**************************************************** */

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  value: orderInfo_t;
  onClick?: (value: orderInfo_t) => void;
  maxWidth?: string;
  statusLabel?: string;
}

const billStatusStyles: Record<
  billStatus_e,
  { backgroundColor: string; color: string }
> = {
  [billStatus_e.PrepareProduct]: {
    backgroundColor: "warning.main",
    color: "warning.contrastText",
  },
  [billStatus_e.PrepareShipment]: {
    backgroundColor: "warning.light",
    color: "warning.contrastText",
  },
  [billStatus_e.Billing]: {
    backgroundColor: "info.main",
    color: "info.contrastText",
  },
  [billStatus_e.WaitingPayment]: {
    backgroundColor: "error.main",
    color: "error.contrastText",
  },
  [billStatus_e.Completed]: {
    backgroundColor: "success.main",
    color: "success.contrastText",
  },
  [billStatus_e.Submitted]: {
    backgroundColor: "warning.dark",
    color: "warning.contrastText",
  },
  [billStatus_e.PaymentNotified]: {
    backgroundColor: "error.light",
    color: "error.contrastText",
  },
  [billStatus_e.PaymentConfirmed]: {
    backgroundColor: "info.dark",
    color: "info.contrastText",
  },
  [billStatus_e.Cancelled]: {
    backgroundColor: "grey.700",
    color: "common.white",
  },
};
/**************************************************** */
//  Function
/**************************************************** */
const CardOrder: React.FC<MyProps> = (props) => {
  const orderDate = props.value.date ? new Date(props.value.date) : undefined;
  const orderDateText =
    orderDate && !Number.isNaN(orderDate.getTime())
      ? orderDate.toLocaleDateString("th-TH")
      : "-";

  return (
    <Card
      variant="elevation"
      sx={{
        display: "flex",
        maxWidth: props.maxWidth,
        width: "100%",
        m: "8px",
        "&[data-active]": {
          backgroundColor: "action.selected",
          "&:hover": {
            backgroundColor: "action.selectedHover",
          },
        },
      }}
    >
      <CardActionArea
        onClick={() => {
          props.onClick?.(props.value);
        }}
        sx={{
          flexDirection: "column",
          justifyContent: "flex-start",
          display: "flex",
          height: "100%",
        }}
      >
        <CardContent
          sx={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              px: 1,
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography component="div" variant="h5">
                {props.value.customer}
              </Typography>
              <Chip
                size="small"
                color={
                  props.value.source === orderSource_e.Online
                    ? "primary"
                    : "default"
                }
                label={
                  props.value.source === orderSource_e.Online
                    ? "หน้าร้าน Online"
                    : "สั่งโดยตรง"
                }
                sx={{ mb: 0.5 }}
              />
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                {`รหัสลูกค้า: ${props.value.customerID}`}
              </Typography>
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                {`รหัสคำสั่งซื้อ: ${props.value.id}`}
              </Typography>
              <Typography
                variant="subtitle2"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                {`วันที่ทำรายการ: ${orderDateText}`}
              </Typography>

              <Typography variant="h6" component="div">
                ยอกรวม:{" "}
                {props.value.total?.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
              </Typography>
            </Box>
            <Box sx={{ mr: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  ...billStatusStyles[props.value.status],
                  p: "4px 8px",
                  borderRadius: 1,
                }}
                textAlign={"center"}
              >
                {props.statusLabel || BillStatusString(props.value.status)}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
              width: "95%",
              py: "8px",
            }}
          >
            {props.value.list.map(
              (product, index) =>
                index < 4 && (
                  <CardMedia
                    key={index}
                    component="img"
                    sx={{ width: 100 }}
                    image={product.img || errImg}
                    onError={(event) => {
                      (event.target as HTMLImageElement).src = errImg;
                    }}
                  />
                ),
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
export default CardOrder;
