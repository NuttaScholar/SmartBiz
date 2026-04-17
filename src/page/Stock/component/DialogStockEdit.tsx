import React, { useMemo } from "react";
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";
import {
  productType_e,
} from "../../../component/Organisms/CardProduct";
import { productInfo_t } from "../../../API/StockService/type";
import DialogEditProductList from "../../../component/Organisms/DialogEditProductList";

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
  type: "in" | "out";
}
//*********************************************
// Component
//*********************************************
const DialogStockEdit: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useStockContext();
  //const authContext = useAuth();
  // Local Variable ***********
  const info = useMemo(() => {
    if (state.productList && state.indexList !== undefined) {
      return state.productList[state.indexList];
    } else {
      return {
        id: "",
        name: "",
        amount: 0,
        price: 0,
        img: "",
        type: productType_e.another,
      } as productInfo_t;
    }
  }, [state.productList, state.indexList]);
  // Local Function ***********
  const handleSubmit = (val :productInfo_t) => {    
    setState({
      ...state,
      dialogOpen: stockDialog_e.none,
      productList: state.productList?.map((item, index) =>
        index === state.indexList ? val : item
      ),
    });
  };
  const onClose = () => {
    setState({ ...state, dialogOpen: stockDialog_e.none });
  };
  return (
    <DialogEditProductList
      open={state.dialogOpen === stockDialog_e.editForm}
      onClose={onClose}
      defaultValue={info}
      onSubmit={handleSubmit}
      hideFieldPrice={props.type === "out"}
    />
  );
};
export default DialogStockEdit;
