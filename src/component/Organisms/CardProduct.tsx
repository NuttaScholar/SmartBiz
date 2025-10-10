import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";
import errImg from "../../assets/NoImage.jpg";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import { productInfo_t } from "../../API/StockService/type";
import { stockStatus_e } from "../../enum";
/**************************************************** */
//  Type
/**************************************************** */
export enum productType_e {
  merchandise,
  material,
  another,
}

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  value: productInfo_t;
  type: productType_e;
  onClick?: (edit: boolean, value: productInfo_t) => void;
  disabled?: boolean;
  maxWidth?: string;
  variant?: "readonly" | "editable" | "deleteable";
}
/**************************************************** */
//  Function
/**************************************************** */
const CardProduct: React.FC<MyProps> = (props) => {
  return (
    <Card
      data-active={props.disabled ? "" : undefined}
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
          if (!props.disabled) {
            props.onClick?.(false, props.value);
          }
        }}
        sx={{
          flexDirection: "row",
          justifyContent: "flex-start",
          display: "flex",
          height: "100%",
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 120 }}
          image={props.value.img}
          onError={(event) => {
            (event.target as HTMLImageElement).src = errImg;
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Typography component="div" variant="h5">
              {props.value.name}
            </Typography>
            <Typography
              variant="subtitle2"
              component="div"
              sx={{ color: "text.secondary" }}
            >
              {`ID: ${props.value.id}`}
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ color: "text.secondary" }}
            >
              {props.value.description}
            </Typography>
            {props.type !== productType_e.material && (
              <Typography variant="subtitle1" component="div">
                ราคา:{" "}
                {props.value.price?.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
              </Typography>
            )}
            {props.type !== productType_e.another && (
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                <Typography variant="subtitle1">จำนวน:</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color:
                      props.value.status === stockStatus_e.stockLow
                        ? "warning.light"
                        : props.value.status === stockStatus_e.stockOut
                          ? "error.light"
                          : "common",
                  }}
                >
                  {props.value.amount}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Box>
      </CardActionArea>
      {props.variant !== "readonly" && props.variant !== undefined && (
        <Box sx={{ py: "4px" }}>
          <IconButton onClick={() => props.onClick?.(true, props.value)}>
            {props.variant === "editable" ? <EditIcon /> : <ClearIcon />}
          </IconButton>
        </Box>
      )}
    </Card>
  );
};
export default CardProduct;
