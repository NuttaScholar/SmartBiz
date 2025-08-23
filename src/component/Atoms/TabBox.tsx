import * as React from "react";
import Box from "@mui/material/Box";
import { Tab, Tabs } from "@mui/material";
import { css_alignItem_t, css_overflow } from "../../type";

//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
  list: string[];
  onChange: (index: number) => void;
  value: number;
  height?: string;
  overflow?: css_overflow;
  alignItems?: css_alignItem_t;
  maxWidth?: string;
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
        maxWidth: props.maxWidth,
        width: "100%", 
        overflow: props.overflow || "hidden",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={props.value} variant="scrollable" onChange={handleChange}>
          {props.list.map((item, index) => (
            <Tab key={index} label={item} />
          ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: props.height || "calc(100vh - 200px)",
          overflowY: "auto",
          alignItems: props.alignItems,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default TabBox;
