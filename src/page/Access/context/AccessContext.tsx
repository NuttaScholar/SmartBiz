// src/context/AuthContext.tsx
import { createContext, ReactNode, useState } from "react";
import { TransitionForm_t } from "../component/DialogFormTransaction";
import { ContactInfo_t, statement_t } from "../../../API/AccountService/type";

export enum accessDialog_e {
  none,
  contactList,
  contactListSearch,
  transactionForm,
  searchTransaction,
  contactFrom,
}
export type access_t = {
  yearSelect: number;
  open: accessDialog_e;
  transitionForm?: TransitionForm_t;
  transaction: statement_t[];
  month: number;
  hasMore: boolean;
  contactList: ContactInfo_t[];
  contactInfo?: ContactInfo_t;
  contactKey?: string;
  fieldContact?: string;
  totalMoney: number;
  refaceTrans: number;
};
export type AccessContext_t = {
  state: access_t;
  setState: (state: access_t) => void;
};
export const AccessDefaultState: access_t = {
  contactList: [],
  hasMore: true,
  month: 12,
  open: accessDialog_e.none,
  totalMoney: 0,
  transaction: [],
  yearSelect: new Date().getFullYear(),
  refaceTrans: 0,
};
export const AccessContext = createContext<AccessContext_t | undefined>(
  undefined
);
AccessContext.displayName = "AccessContext";

