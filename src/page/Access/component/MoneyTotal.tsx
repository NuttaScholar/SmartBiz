import { Box, SxProps, Theme, Typography } from "@mui/material";
import Text_Money from "../../../component/Atoms/Text_Money";
import React from "react";
import { useAccess } from "../hooks/useAccess";

//*********************************************
// Style
//*********************************************
const titlep: React.CSSProperties = {
    fontSize: "36px"
}


//*********************************************
// Variable
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps{
    sx?: SxProps<Theme>;
}
//*********************************************
// Component
//*********************************************
const MoneyTotal: React.FC<myProps> = (props) => {
    const { state } = useAccess();
    const titleStyle: React.CSSProperties = {
        ...titlep,
        color: state.totalMoney>0 ? "#4caf50" : state.totalMoney<0?"red": "black",
      };
    return (
        <Box sx={props.sx}>
            <Typography variant="h5">
                ยอดเงินคงเหลือ
            </Typography>
            <Text_Money sx={titleStyle} value={state.totalMoney}/>
        </Box>
    )
}
export default MoneyTotal;