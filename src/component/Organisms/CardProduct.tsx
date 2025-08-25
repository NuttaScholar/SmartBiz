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
/**************************************************** */
//  Type
/**************************************************** */
export type productInfo_t = {
  id: string;
  name: string;
  price: number;
  img: string;
  description?: string;
  stock: number;
};
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  value: productInfo_t;
  onClick?: (edit: boolean, value: productInfo_t) => void;
  disabled?: boolean;
  maxWidth?: string;
  editable?: boolean;
}
/**************************************************** */
//  Function
/**************************************************** */
const CardProduct: React.FC<MyProps> = (props) => {
  const [image, setImage] = React.useState<string>(props.value.img || errImg);
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
          image={image}
          onError={() => {
            setImage(errImg);
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
              {props.value.description}
            </Typography>
            <Typography variant="subtitle1" component="div">
              ราคา:{" "}
              {props.value.price.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </Typography>
            <Typography variant="subtitle1" component="div">
              สต็อก: {props.value.stock}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
      {props.editable && (
        <Box sx={{ py: "4px" }}>
          <IconButton onClick={() => props.onClick?.(true, props.value)}>
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Card>
  );
};
export default CardProduct;
