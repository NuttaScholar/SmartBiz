import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ResponsiveAppBar from "./component/test";
import { Box, Button } from "@mui/material";
import Field from "./component/Atoms/Field";
import FieldSelector from "./component/Molecules/FieldSelector";
import FieldText from "./component/Molecules/FieldText";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import FieldDate from "./component/Molecules/FieldDate";
import FieldDuration from "./component/Molecules/FieldDuration";

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
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <FieldSelector />
        <FieldText
          name="Text"
          icon={<SyncAltIcon />}
          label="Label"
          placeholder="Placeholder"
          defauleValue="1234"
          onChange={(event) => {
            console.log(event.target.value);
          }}
        />
        <FieldDate icon={<SyncAltIcon />}/>
        <FieldDuration icon={<SyncAltIcon />}/>
        <Button variant="contained" type="submit">
          Comfirm
        </Button>
      </Box>
    </>
  );
}

export default App;
