import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import Field from "../Atoms/Field";
import React from "react";
import ClearIcon from "@mui/icons-material/Clear";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import errImg from "../../assets/NoImage.jpg";
/**************************************************** */
//  Type
/**************************************************** */
type productInfo_t = {
  id: string;
  name: string;
  price: number;
  img: string;
  description: string;
  stock: number;
};
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  value: productInfo_t;
  onClick?: (value: productInfo_t) => void;
  disabled?: boolean;
  maxWidth?: string;
}
/**************************************************** */
//  Function
/**************************************************** */
const CardProduct: React.FC<MyProps> = (props) => {
  const [image, setImage] = React.useState<string>(props.value.img || errImg);
  return (
    <Card sx={{ maxWidth: props.maxWidth, width: "100%" }}>
      <CardActionArea
        data-active={props.disabled ? "" : undefined}
        sx={{
          flexDirection: "row",
          justifyContent: "flex-start",
          display: "flex",
          height: "100%",
          "&[data-active]": {
            backgroundColor: "action.selected",
            "&:hover": {
              backgroundColor: "action.selectedHover",
            },
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 151 }}
          image={image}
          onError={() => {}}
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
    </Card>
  );
};
export default CardProduct;
