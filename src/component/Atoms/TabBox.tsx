import * as React from "react";
import Box from "@mui/material/Box";
import { Badge, BadgeProps, Divider, styled, Tab, Tabs } from "@mui/material";
import { css_alignItem_t, css_overflow } from "../../type";

//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
  list: string[];
  valueList?: number[];
  onChange?: (index: number) => void;
  onClick?: (index: number) => void;
  value: number;
  gotoTop?: number;
  height?: string;
  overflow?: css_overflow;
  alignItems?: css_alignItem_t;
  maxWidth?: string;
}
//*************************************************
// StyledBadge
//*************************************************
const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 4,
    top: 10,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: "0 4px",
  },
}));
//*************************************************
// Function
//*************************************************
const TabBox: React.FC<myProps> = (props) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    props.onChange?.(newValue);
  };
  React.useEffect(() => {
    containerRef?.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [props.gotoTop]);
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
            <React.Fragment key={index}>
              <StyledBadge
                badgeContent={props.valueList?.[index] || 0}
                color="primary"
              >
                <Tab
                  key={index}
                  label={item}
                  onClick={() => props.onClick?.(index)}
                />
                <Divider orientation="vertical" variant="middle" flexItem />
              </StyledBadge>
            </React.Fragment>
          ))}
        </Tabs>
      </Box>
      <Box
        ref={containerRef}
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
