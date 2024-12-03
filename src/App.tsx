import "./App.css";
import ResponsiveAppBar from "./component/test";
import { Box } from "@mui/material";
import Label_parameter from "./component/Atoms/Label_parameter";

//*********************************************
// Sub Function
//*********************************************

//*********************************************
// Main Function
//*********************************************
function App() {
  return (
    <>
      <ResponsiveAppBar />
      <Box        
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Label_parameter label="label" value={123} width="100px"/>
      </Box>
    </>
  );
}

export default App;
