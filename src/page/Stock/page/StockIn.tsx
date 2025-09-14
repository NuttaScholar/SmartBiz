import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FormStockHeader from "../component/FormStockHeader";
import FormStock from "../component/FormStock";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import {
  stock_t,
  StockContext,
  StockDefaultState,
} from "../context/StockContext";
import React from "react";
import StockList from "../component/StockList";

export default function Page_StockIn() {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const navigate = useNavigate();
  return (
    <StockContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"เติมสต็อก"} onClick={() => navigate("/stock")}>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton size="large"
            sx={{
              color: "white",
            }}
          >
            <SaveIcon sx={{fontSize: 32}}/>
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FormStockHeader />
        <FormStock type="in" />
        <StockList/>
      </Box>
    </StockContext.Provider>
  );
}
