import * as React from "react";
import Box from "@mui/material/Box";
import { Tab, Tabs } from "@mui/material";

//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
  list: string[];
  onChange: (index: number) => void;
  value: number;
  height?: string;
}
//*************************************************
// Function
//*************************************************
const TabBox: React.FC<myProps> = (props) => {
  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    props.onChange(newValue);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "790px",
        width: "100%",
        border: "1px solid #e0e0e0",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        bgcolor: "background.paper",
        px: "16px",
        my: "16px",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={props.value} onChange={handleChange}>
          {props.list.map((item, index) => (
            <Tab key={index} label={item} />
          ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: props.height || "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default TabBox;
