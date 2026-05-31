import React from "react";
import FieldContact from "../../../component/Molecules/FieldContact";
import { useAuth } from "../../../hooks/useAuth";
import contactWithRetry_f from "../lib/contactWithRetry";
import { ErrorString } from "../../../function/Enum";
import { ContactInfo_t } from "../../../API/AccountService/type";
import { useNavigate } from "react-router-dom";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  label?: string;
  placeholder?: string;
  name?: string;
  icon?: React.ReactNode;
  value?: string;
  onClear?: () => void;
  onOpenList?: (contactList: ContactInfo_t[]) => void;
  readonly?: boolean;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContactAccess: React.FC<MyProps> = (props) => {
  // Hook *********************
  const AuthContext = useAuth();
  const navigate = useNavigate();

  // Local function ***********
  const onOpenList = async () => {
    contactWithRetry_f
      .get(AuthContext)
      .then((val) => {
        if (val.data) {
          props.onOpenList?.(val.data);          
        } else if (val.errCode) {
          if (redirectToLoginOnAuthError(navigate, val.errCode)) return;

          alert(ErrorString(val.errCode));
        }
      })
      .catch((err) => {
        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        console.log(err);
      });
  };
  return (
    <React.Fragment>
      <FieldContact label={props.label} readonly={props.readonly} icon={props.icon} name={props.name} value={props.value} onClear={props.onClear} onOpenList={onOpenList}/>  
    </React.Fragment>
  );
};
export default FieldContactAccess;
