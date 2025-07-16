import { listSelect_t } from "../../../component/Molecules/FieldSelector";
import { transactionType_e } from "../../../enum";

export const TypeSelect: listSelect_t[] = [
    { label: "รายรับ", value: transactionType_e.income },
    { label: "รายจ่าย", value: transactionType_e.expenses },
    { label: "เงินกู้", value: transactionType_e.loan },
    { label: "ให้ยืม", value: transactionType_e.lend },
  ];