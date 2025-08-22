import * as React from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
//*************************************************
// Interface
//*************************************************
interface myProps {
  label: string;
  value: number;
  onClick?: () => void;
  selected?: boolean;
  color_value?: string;
  maxWidth?: string;
}
//*************************************************
// Function
//*************************************************
const CardValue: React.FC<myProps> = (props) => {
  return (
    <Card sx={{ maxWidth: props.maxWidth, width: "100%" }}>
      <CardActionArea
        onClick={props.onClick}
        data-active={props.selected ? "" : undefined}
        sx={{
          height: "100%",
          "&[data-active]": {
            backgroundColor: "action.selected",
            "&:hover": {
              backgroundColor: "action.selectedHover",
            },
          },
        }}
      >
        <CardContent sx={{ height: "100%" }}>
          <Typography variant="body2" component="div">
            {props.label}
          </Typography>
          <Typography
            variant="h5"
            color={props.color_value || "text.secondary"}
          >
            {props.value}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardValue;
