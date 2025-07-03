import { Box, SxProps, Theme, Typography } from "@mui/material";
import Text_Money from "../Atoms/Text_Money";

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
    label: string;
    value: number;
    sx?: SxProps<Theme>;
}
//*********************************************
// Component
//*********************************************
const MoneyTotal: React.FC<myProps> = (props) => {
    return (
        <Box sx={props.sx}>
            <Typography variant="h5">
                {props.label}
            </Typography>
            <Text_Money sx={{fontSize: "36px"}} value={props.value}/>
        </Box>
    )
}
export default MoneyTotal;