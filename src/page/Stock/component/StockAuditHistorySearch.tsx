import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import {
  AuditAction_t,
  AuditOperation_t,
} from "../../../API/StockService/type";
import FieldDuration from "../../../component/Molecules/FieldDuration";
import FieldSelector, {
  listSelect_t,
} from "../../../component/Molecules/FieldSelector";
import FieldText from "../../../component/Molecules/FieldText";

export type StockAuditHistoryFilters_t = {
  productID: string;
  action: "" | AuditAction_t;
  operation: "" | AuditOperation_t;
  actorName: string;
  actorType: "" | "user" | "service";
  from: Date | null;
  to: Date | null;
};

const EMPTY_STOCK_AUDIT_FILTERS: StockAuditHistoryFilters_t = {
  productID: "",
  action: "",
  operation: "",
  actorName: "",
  actorType: "",
  from: null,
  to: null,
};

const ACTION_OPTIONS: listSelect_t[] = [
  { value: 1, label: "สร้าง" },
  { value: 2, label: "แก้ไข" },
  { value: 3, label: "ลบ" },
];

const OPERATION_OPTIONS: listSelect_t[] = [
  { value: 1, label: "สร้าง" },
  { value: 2, label: "แก้ไข" },
  { value: 3, label: "ลบ" },
  { value: 4, label: "รับเข้า" },
  { value: 5, label: "เบิกออก" },
];

const ACTOR_TYPE_OPTIONS: listSelect_t[] = [
  { value: 1, label: "ผู้ใช้" },
  { value: 2, label: "Service" },
];

interface Props {
  onSearch: (filters: StockAuditHistoryFilters_t) => void;
}

export default function StockAuditHistorySearch({ onSearch }: Props) {
  const [draft, setDraft] = React.useState<StockAuditHistoryFilters_t>(
    EMPTY_STOCK_AUDIT_FILTERS,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({ ...draft });
  }

  function handleClear() {
    setDraft(EMPTY_STOCK_AUDIT_FILTERS);
    onSearch(EMPTY_STOCK_AUDIT_FILTERS);
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      variant="outlined"
      sx={{ p: { xs: 1, sm: 2 }, mb: 2, borderRadius: 2 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <HistoryIcon color="primary" />
        <Typography variant="h6">ค้นหาประวัติสต็อก</Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <FieldText
          label="รหัสสินค้า"
          value={draft.productID}
          onChange={(event) =>
            setDraft({ ...draft, productID: event.target.value })
          }
        />
        <FieldSelector
          label="การทำรายการ"
          list={OPERATION_OPTIONS}
          value={operationSelectorValue(draft.operation)}
          onChange={(value) =>
            setDraft({ ...draft, operation: operationFromSelector(value) })
          }
        />
        <FieldSelector
          label="การเปลี่ยนแปลง"
          list={ACTION_OPTIONS}
          value={actionSelectorValue(draft.action)}
          onChange={(value) =>
            setDraft({ ...draft, action: actionFromSelector(value) })
          }
        />
        <FieldText
          label="ผู้ดำเนินการ"
          value={draft.actorName}
          onChange={(event) =>
            setDraft({ ...draft, actorName: event.target.value })
          }
        />
        <FieldSelector
          label="ประเภทผู้ดำเนินการ"
          list={ACTOR_TYPE_OPTIONS}
          value={actorTypeSelectorValue(draft.actorType)}
          onChange={(value) =>
            setDraft({ ...draft, actorType: actorTypeFromSelector(value) })
          }
        />
        <FieldDuration
          name="stockAuditDuration"
          icon={<CalendarMonthIcon />}
          value={{ from: draft.from, to: draft.to }}
          onChange={({ from, to }) =>
            setDraft({
              ...draft,
              from: from?.startOf("day").toDate() ?? null,
              to: to?.endOf("day").toDate() ?? null,
            })
          }
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            width: { xs: "100%", md: "calc(50% - 4px)" },
            justifyContent: "center",
            gap: { xs: 1, md: 4 },
            maxWidth: 480,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleClear}
            sx={{ width: { xs: "100%", md: 150 }, height: 50 }}
          >
            ล้างตัวกรอง
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ width: { xs: "100%", md: 150 }, height: 50 }}
          >
            ค้นหา
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function actionSelectorValue(value: StockAuditHistoryFilters_t["action"]) {
  return value === "CREATE" ? "1" : value === "UPDATE" ? "2" : value === "DELETE" ? "3" : "";
}

function actionFromSelector(value: number | null): StockAuditHistoryFilters_t["action"] {
  return value === 1 ? "CREATE" : value === 2 ? "UPDATE" : value === 3 ? "DELETE" : "";
}

function operationSelectorValue(value: StockAuditHistoryFilters_t["operation"]) {
  const values: Record<AuditOperation_t, string> = {
    PRODUCT_CREATE: "1",
    PRODUCT_UPDATE: "2",
    PRODUCT_DELETE: "3",
    STOCK_IN: "4",
    STOCK_OUT: "5",
  };
  return value ? values[value] : "";
}

function operationFromSelector(value: number | null): StockAuditHistoryFilters_t["operation"] {
  const values: Record<number, AuditOperation_t> = {
    1: "PRODUCT_CREATE",
    2: "PRODUCT_UPDATE",
    3: "PRODUCT_DELETE",
    4: "STOCK_IN",
    5: "STOCK_OUT",
  };
  return value ? values[value] || "" : "";
}

function actorTypeSelectorValue(value: StockAuditHistoryFilters_t["actorType"]) {
  return value === "user" ? "1" : value === "service" ? "2" : "";
}

function actorTypeFromSelector(value: number | null): StockAuditHistoryFilters_t["actorType"] {
  return value === 1 ? "user" : value === 2 ? "service" : "";
}
