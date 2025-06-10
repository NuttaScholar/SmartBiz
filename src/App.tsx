import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Page_Access from "./page/Access";
import Page_Login from "./page/Login";
import Page_Bill from "./page/Bill";
import Page_Cadit from "./page/Cadit";
import Page_CheckIn from "./page/CheckIn";
import Page_Stock from "./page/Stork";
import Page_NotFound from "./page/NotFound";
//*********************************************
// Sub Function
//*********************************************

//*********************************************
// Main Function
//*********************************************
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page_Login />} />
        <Route path="/access" element={<Page_Access />} />
        <Route path="/login" element={<Page_Login />} />
        <Route path="/bill" element={<Page_Bill />} />
        <Route path="/cadit" element={<Page_Cadit />} />
        <Route path="/checkIn" element={<Page_CheckIn />} />
        <Route path="/stock" element={<Page_Stock />} />
        <Route path="*" element={<Page_NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
