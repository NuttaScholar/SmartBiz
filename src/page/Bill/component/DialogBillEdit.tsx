import React, { useMemo } from "react";
import { productInfo_t } from "../../../API/StockService/type";
import { useBillContext } from "../hooks/useBillContex";
import DialogEditProductList from "../../../component/Organisms/DialogEditProductList";
import { billDialog_e } from "../context/BillContext";

//*********************************************
// Type
//*********************************************

//*********************************************
// Constante
//*********************************************

//*********************************************
// Transition
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  hideFieldPrice?: boolean;
  onSubmit?: (data: productInfo_t) => void;
}
//*********************************************
// Component
//*********************************************
const DialogBillEdit: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useBillContext();
  //const authContext = useAuth();
  // Local Variable ***********
  const info = useMemo(() => {
    if (state.merchList && state.indexList !== undefined) {
      return state.merchList[state.indexList];
    } else {
      return undefined
    }
  }, [state.merchList, state.indexList]);
  // Local Function ***********
  const onClose = () => {
    setState({ ...state, dialogOpen: billDialog_e.none });
  };
  return (
    <DialogEditProductList
      open={state.dialogOpen === billDialog_e.editForm}
      onClose={onClose}
      defaultValue={info}
      onSubmit={props.onSubmit}
      hideFieldPrice={props.hideFieldPrice}
    />
  );
};
export default DialogBillEdit;
