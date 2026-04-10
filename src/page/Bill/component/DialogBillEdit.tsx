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
  const handleSubmit = (val :productInfo_t) => {   
    setState({
      ...state,
      dialogOpen: billDialog_e.none,
      merchList: state.merchList?.map((item, index) =>
        index === state.indexList ? val : item,
      ),
    });
  };
  const onClose = () => {
    setState({ ...state, dialogOpen: billDialog_e.none });
  };
  return (
    <DialogEditProductList
      open={state.dialogOpen === billDialog_e.editForm}
      onClose={onClose}
      defaultValue={info}
      onSubmit={handleSubmit}
      hideFieldPrice={props.hideFieldPrice}
    />
  );
};
export default DialogBillEdit;
