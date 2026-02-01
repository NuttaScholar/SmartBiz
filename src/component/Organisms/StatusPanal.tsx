import { Box } from "@mui/material";
import CardValue from "../Atoms/CardValue";

//*********************************************
// type
//*********************************************
export type listStatus_t = {
  label: string;
  id: number | string;
  color_value?:
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "inherit";
  onClick?: () => void;
}[];
export type valueStatus_t = number | undefined;
//*************************************************
// Interface
//*************************************************
interface myProps {
  list: listStatus_t;
  value?: valueStatus_t[];
  state?: number | string;
  maxWidth?: string;
}
//*************************************************
// Function
//*************************************************
const StatusPanel: React.FC<myProps> = (props) => {
  return (
    <Box
      sx={{
        my: "8px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {props.list.map((item, index) => (
        <CardValue
          key={item.id}
          label={item.label}
          selected={props.state === item.id}
          value={
            props.value && props.value.length > index
              ? props.value[index]
              : undefined
          }
          color_value={item.color_value}
          onClick={item.onClick}
          maxWidth={props.maxWidth || "150px"}
        />
      ))}
    </Box>
  );
};
export default StatusPanel;
