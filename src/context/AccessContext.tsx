// src/context/AuthContext.tsx
import { createContext, useState, ReactNode } from "react";
import { TransitionForm_t } from "../page/Access/component/DialogFormTransaction";
import { ContactInfo_t, statement_t } from "../API/AccountService/type";


export type access_t = {
  yearSelect: number;
  openDialogSetUser: boolean;
  openDialogAdd: boolean;
  openDialogEdit: boolean;
  openDialogSearch: boolean;
  transitionForm?: TransitionForm_t;
  transaction: statement_t[];
  month: number;
  hasMore: boolean;
  contactList: ContactInfo_t[];
  searchTranResult: statement_t[];
  totalMoney: number;
};
export type AccessContext_t = {
  state: access_t;
  setState: (state: access_t) => void;
};
export const AccessDefaultState: access_t = {
  contactList: [],
  hasMore: true,
  month: 12,
  openDialogAdd: false,
  openDialogEdit: false,
  openDialogSearch: false,
  openDialogSetUser: false,
  searchTranResult: [],
  totalMoney: 0,
  transaction: [],
  yearSelect: new Date().getFullYear(),
};
export const AccessContext = createContext<AccessContext_t|undefined>(undefined);
AccessContext.displayName = "AccessContext";

export const AccessProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<access_t>(AccessDefaultState);

  return (
    <AccessContext.Provider value={{ state, setState }}>
      {children}
    </AccessContext.Provider>
  );
};
