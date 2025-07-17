import * as React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import MoneyTotal from "./component/MoneyTotal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import YearyTransaction from "./component/YearyTransaction";
import {
  access_t,
  AccessContext,
  AccessDefaultState,
} from "./context/AccessContext";
import { initTrans } from "./lib/initTrans";
import SpeedDial_Access from "./component/SpeedDialAccess";
import DialogFormTransaction from "./component/DialogFormTransaction";

const Page_Access: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const authContext = useAuth();
  const [state, setState] = React.useState<access_t>(AccessDefaultState);
  // Use Effect **************
  React.useEffect(() => {
    try {
      initTrans(authContext, { state, setState });
    } catch (err) {
      alert(`${err}`);
      navigate("/");
    }
  }, []);
  return (
    <AccessContext.Provider value={{ state, setState }}>
      <AppBar_c />
      <MoneyTotal sx={{ textAlign: "center", mt: "16px" }} />
      <YearyTransaction />
      <SpeedDial_Access />
      <DialogFormTransaction />
    </AccessContext.Provider>
  );
};

export default Page_Access;
