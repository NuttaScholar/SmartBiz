import { Box, SxProps, Theme, Typography } from "@mui/material";
import Text_Money from "../../../component/Atoms/Text_Money";
import React from "react";
import { useAccess } from "../../../hooks/useAccess";

//*********************************************
// Style
//*********************************************



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
    return (
        <Box sx={props.sx}>
            <Typography variant="h5">
                ยอดเงินคงเหลือ
            </Typography>
            <Text_Money sx={{fontSize: "36px"}} value={state.totalMoney}/>
        </Box>
    )
}
export default MoneyTotal;