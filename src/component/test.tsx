import { Box } from "@mui/material";
import MonthlyTotalList from "./Molecules/MonthlyTotalList";
import { DailyMoneyList } from "../dataSet/DataMoney";

export default function FullScreenDialog() {
  return (
    <Box sx={{ marginTop: "16px" }}>
      <MonthlyTotalList value={DailyMoneyList}/>
    </Box>
  );
}
