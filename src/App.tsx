import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ResponsiveAppBar from "./component/test";
import { Box, Button } from "@mui/material";
import Label_parameter from "./component/Atoms/Label_parameter";

//*********************************************
// Sub Function
//*********************************************
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formJson = Object.fromEntries((formData as any).entries());
  const entries = formData.entries();
  const [key, value] = entries;
  console.log(formJson);
  console.log(key, value);
};
//*********************************************
// Main Function
//*********************************************
function App() {
  const [count, setCount] = useState(0);

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
