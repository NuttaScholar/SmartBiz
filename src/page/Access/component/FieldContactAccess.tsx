import React from "react";
import FieldContact from "../../../component/Molecules/FieldContact";
import { useAuth } from "../../../hooks/useAuth";
import contactWithRetry_f from "../lib/contactWithRetry";
import { ErrorString } from "../../../function/Enum";
import { ContactInfo_t } from "../../../API/AccountService/type";

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  placeholder?: string;
  name?: string;
  icon?: React.ReactNode;
  value?: string;
  onClear?: () => void;
  onOpenList?: (contactList: ContactInfo_t[]) => void;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContactAccess: React.FC<MyProps> = (props) => {
  // Hook *********************
  const AuthContext = useAuth();

  // Local function ***********
  const onOpenList = async () => {
    contactWithRetry_f
      .get(AuthContext)
      .then((val) => {
        if (val.result) {
          props.onOpenList?.(val.result);          
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
      <FieldContact icon={props.icon} name={props.name} value={props.value} onClear={props.onClear} onOpenList={onOpenList}/>  
    </React.Fragment>
  );
};
export default FieldContactAccess;
