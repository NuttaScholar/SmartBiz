import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";
import errImg from "../../assets/NoImage.jpg";
import { orderInfo_t } from "../../API/BillService/type";
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
}
/**************************************************** */
//  Function
/**************************************************** */
const CardOrder: React.FC<MyProps> = (props) => {
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
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CardContent sx={{ flex: "1", flexDirection: "row" }}>
            <Typography component="div" variant="h5">
              {props.value.customer}
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
              {`วันที่ทำรายการ: ${new Date().toLocaleDateString("th-TH")}`}
            </Typography>

            <Typography variant="h6" component="div">
              ยอกรวม:{" "}
              {props.value.total?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </Typography>
          </CardContent>
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
      </CardActionArea>
    </Card>
  );
};
export default CardOrder;
