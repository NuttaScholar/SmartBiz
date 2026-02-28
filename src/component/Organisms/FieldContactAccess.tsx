import React from "react";
import { ContactInfo_t } from "../../API/AccountService/type";
import { useAuth } from "../../hooks/useAuth";
import contactWithRetry_f from "../../page/Access/lib/contactWithRetry";
import { ErrorString } from "../../function/Enum";
import FieldContact from "../Molecules/FieldContact";
import DialogContactList from "./DialogContactList";
import DialogFormContact from "./DialogFormContact";

/**************************************************** */
//  Type
/**************************************************** */
enum dialog_e {
  none,
  contactList,
  contactForm,
}
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
  onCloseList?: () => void;
  onChange?: (val: string) => void;
  readonly?: boolean;
  hideField?: boolean;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContactAccess: React.FC<MyProps> = (props) => {
  // Hook *********************
  const AuthContext = useAuth();
  const [open, setOpen] = React.useState<dialog_e>(dialog_e.none);
  const [list, setList] = React.useState<ContactInfo_t[]>([]);
  const [dataForm, setDataForm] = React.useState<ContactInfo_t>();
  // Local function ***********
  const onOpenList = async () => {
    contactWithRetry_f
      .get(AuthContext)
      .then((val) => {
        if (val.result) {
          props.onOpenList?.(val.result);
          setList(val.result);
          setOpen(dialog_e.contactList);
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
      <FieldContact
        label={props.label}
        placeholder={props.placeholder}
        hideField={props.hideField}
        readonly={props.readonly}
        icon={props.icon}
        name={props.name}
        value={props.value}
        onClear={props.onClear}
        onOpenList={onOpenList}
      />
      <DialogContactList
        list={list}
        open={open === dialog_e.contactList}
        onClose={() => {
          setOpen(dialog_e.none);
          props.onCloseList;
        }}
        onSelect={(codeName) => {
          setOpen(dialog_e.none);
          props.onChange?.(codeName);
        }}
        onAdd={() => setOpen(dialog_e.contactForm)}
        onEdit={(val) => {
          setOpen(dialog_e.contactForm);
          setDataForm(val);
        }}
        onChange={(newList) => setList(newList)}
      />
      <DialogFormContact
        open={open === dialog_e.contactForm}
        defaultValue={dataForm}
        onClose={(val) => {
          if (val) {
            setList(val);
          }
          setOpen(dialog_e.contactList);
          setDataForm(undefined);
        }}
      />
    </React.Fragment>
  );
};
export default FieldContactAccess;
