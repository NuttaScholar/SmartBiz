import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { AuditAction_t } from "../../../API/AccountService/type";
import FieldDuration from "../../../component/Molecules/FieldDuration";
import FieldSelector, {
  listSelect_t,
} from "../../../component/Molecules/FieldSelector";
import FieldText from "../../../component/Molecules/FieldText";

export type AuditHistoryFilters_t = {
  transactionId: string;
  action: "" | AuditAction_t;
  actorName: string;
  actorType: "" | "user" | "service";
  from: Date | null;
  to: Date | null;
};

interface AuditHistorySearchProps {
  onSearch: (filters: AuditHistoryFilters_t) => void;
}

const EMPTY_FILTERS: AuditHistoryFilters_t = {
  transactionId: "",
  action: "",
  actorName: "",
  actorType: "",
  from: null,
  to: null,
};

const ACTION_OPTIONS: listSelect_t[] = [
  { value: 1, label: "สร้างรายการ" },
  { value: 2, label: "แก้ไขรายการ" },
  { value: 3, label: "ลบรายการ" },
];

const ACTOR_TYPE_OPTIONS: listSelect_t[] = [
  { value: 1, label: "ผู้ใช้" },
  { value: 2, label: "Service" },
];

const FILTER_FIELD_SX = {
  width: { xs: "100%", md: "calc(50% - 4px)" },
  justifyItems: "center",
  minWidth: 0,
  "& > *": {
    width: "100%",
    minWidth: 0,
    maxWidth: "480px",
  },
} as const;

export default function AuditHistorySearch({
  onSearch,
}: AuditHistorySearchProps) {
  const [draft, setDraft] =
    React.useState<AuditHistoryFilters_t>(EMPTY_FILTERS);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({ ...draft });
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    onSearch(EMPTY_FILTERS);
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
        <Typography variant="h6">ค้นหาประวัติ</Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "1000px",
          mx: "auto",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <FieldText
          label="Transaction ID"
          value={draft.transactionId}
          onChange={(event) =>
            setDraft({ ...draft, transactionId: event.target.value })
          }
        />
        <FieldSelector
          label="การทำรายการ"
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
          name="auditDuration"
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
            alignItems: "center",
            gap: { xs: 1, md: 4 },
            minWidth: 0,
            maxWidth: "480px",
          }}
        >
          <Button
            sx={{
              width: { xs: "100%", md: "150px" },
              height: "50px",
              letterSpacing: "2px",
            }}
            type="button"
            variant="outlined"
            onClick={handleClear}
          >
            ล้างตัวกรอง
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              width: { xs: "100%", md: "150px" },
              height: "50px",
              letterSpacing: "2px",
            }}
          >
            ค้นหา
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function actionSelectorValue(action: AuditHistoryFilters_t["action"]) {
  if (action === "CREATE") return "1";
  if (action === "UPDATE") return "2";
  if (action === "DELETE") return "3";
  return "";
}

function actionFromSelector(
  value: number | null,
): AuditHistoryFilters_t["action"] {
  if (value === 1) return "CREATE";
  if (value === 2) return "UPDATE";
  if (value === 3) return "DELETE";
  return "";
}

function actorTypeSelectorValue(actorType: AuditHistoryFilters_t["actorType"]) {
  if (actorType === "user") return "1";
  if (actorType === "service") return "2";
  return "";
}

function actorTypeFromSelector(
  value: number | null,
): AuditHistoryFilters_t["actorType"] {
  if (value === 1) return "user";
  if (value === 2) return "service";
  return "";
}
