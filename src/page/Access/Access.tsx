import * as React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import MoneyTotal from "./component/MoneyTotal";
import YearyTransaction from "./component/YearyTransaction";
import {
  access_t,
  AccessContext,
  AccessDefaultState,
} from "./context/AccessContext";
import SpeedDial_Access from "./component/SpeedDialAccess";
import DialogFormTransaction from "./component/DialogFormTransaction";

const Page_Access: React.FC = () => {
  // Hook **************
  const [state, setState] = React.useState<access_t>({
    ...AccessDefaultState,
    containerRef: React.useRef<HTMLDivElement>(null),
  });

  // Use Effect **************

  return (
    <AccessContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <MoneyTotal sx={{ textAlign: "center", mt: "16px" }} />
        <YearyTransaction />
        <SpeedDial_Access />
        <DialogFormTransaction />
      </AppBar_c>
    </AccessContext.Provider>
  );
};

export default Page_Access;
