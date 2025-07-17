import React from "react";
import FieldContact from "../../../component/Molecules/FieldContact";
import { useAuth } from "../../../hooks/useAuth";
import { useAccess } from "../hooks/useAccess";
import contactWithRetry_f from "../lib/contactWithRetry";
import { ErrorString } from "../../../function/Enum";
import { accessDialog_e } from "../context/AccessContext";

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  placeholder?: string;
  name?: string;
  icon?: React.ReactNode;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContactAccess: React.FC<MyProps> = (props) => {
  // Hook *********************
  const AuthContext = useAuth();
  const { state, setState } = useAccess();

  // Local function ***********
  const onClearHandler = () => {
    setState({...state, fieldContact: "" });
  };
  const onOpenList = async () => {
    contactWithRetry_f
      .get(AuthContext)
      .then((val) => {
        if (val.result) {
          setState({ ...state, contactList: val.result, open: accessDialog_e.contactList, contactKey: undefined });
        } else if (val.errCode) {
          alert(ErrorString(val.errCode));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <React.Fragment>
      <FieldContact icon={props.icon} name={props.name} value={state.fieldContact} onClear={onClearHandler} onOpenList={onOpenList}/>  
    </React.Fragment>
  );
};
export default FieldContactAccess;
