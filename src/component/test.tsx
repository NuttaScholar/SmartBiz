import * as React from "react";
import FieldContact from "./Molecules/FieldContact";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { Alert, Box } from "@mui/material";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import ProductList from "./Molecules/ProductList";
import MonthlyTotalList from "./Organisms/MonthlyTotalList";
import { DailyMoneyList } from "../dataSet/DataMoney";

export default function FullScreenDialog() {
  return (
    <Box sx={{ marginTop: "16px" }}>
      <MonthlyTotalList value={DailyMoneyList}/>
    </Box>
  );
}
