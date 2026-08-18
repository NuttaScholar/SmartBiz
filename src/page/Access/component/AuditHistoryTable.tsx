import {
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { AuditAction_t, LogAudit_t } from "../../../API/AccountService/type";
import MobileAuditHistoryList from "./MobileAuditHistoryList";

const ACTION_COLORS: Record<AuditAction_t, "success" | "warning" | "error"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "error",
};

interface AuditHistoryTableProps {
  logs: LogAudit_t[];
  loading: boolean;
  total: number;
  hasMore: boolean;
  page: number;
  rowsPerPage: number;
  onOpenDetail: (id: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

type AuditHistoryContentProps = Pick<
  AuditHistoryTableProps,
  "logs" | "loading" | "onOpenDetail"
>;

export default function AuditHistoryTable({
  logs,
  loading,
  total,
  hasMore,
  page,
  rowsPerPage,
  onOpenDetail,
  onPageChange,
  onRowsPerPageChange,
}: AuditHistoryTableProps) {
  const contentProps: AuditHistoryContentProps = {
    logs,
    loading,
    onOpenDetail,
  };

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
      <MobileAuditHistoryList
        {...contentProps}
        hasMore={hasMore}
        onLoadMore={() => onPageChange(page + 1)}
      />
      <PcAuditHistoryTable {...contentProps} />
      <AuditHistoryPagination
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
}

function PcAuditHistoryTable({
  logs,
  loading,
  onOpenDetail,
}: AuditHistoryContentProps) {
  return (
    <TableContainer
      sx={{
        display: { xs: "none", md: "block" },
        maxHeight: "calc(100vh - 330px)",
        minHeight: 240,
      }}
    >
      <Table stickyHeader sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: "secondary.main" }}>
              วันและเวลา
            </TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }}>รายการ</TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }}>
              ผู้ดำเนินการ
            </TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }}>
              Transaction
            </TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }} align="right">
              ยอดก่อน
            </TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }} align="right">
              ยอดหลัง
            </TableCell>
            <TableCell sx={{ bgcolor: "secondary.main" }}>
              ข้อมูลที่เปลี่ยน
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
                sx={{ py: 8, color: "text.secondary" }}
              >
                ไม่พบประวัติการทำรายการ
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow
                hover
                key={log.id}
                onClick={() => onOpenDetail(log.id)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{formatDateTime(log.occurredAt)}</TableCell>
                <TableCell>
                  <ActionChip action={log.action} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.actor.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.actor.type}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                  {log.transactionId}
                </TableCell>
                <TableCell align="right">
                  {formatMoney(log.wallet.beforeAmount)}
                </TableCell>
                <TableCell align="right">
                  {formatMoney(log.wallet.afterAmount)}
                </TableCell>
                <TableCell>
                  <ChangedFieldChips fields={log.changedFields} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AuditHistoryPagination({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Pick<
  AuditHistoryTableProps,
  | "total"
  | "page"
  | "rowsPerPage"
  | "onPageChange"
  | "onRowsPerPageChange"
>) {
  return (
    <TablePagination
      component="div"
      count={total}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10, 20, 50, 100]}
      onPageChange={(_event, nextPage) => onPageChange(nextPage)}
      onRowsPerPageChange={(event) =>
        onRowsPerPageChange(Number(event.target.value))
      }
      sx={{
        display: { xs: "none", md: "block" },
        ".MuiTablePagination-toolbar": {
          px: { xs: 0.5, sm: 2 },
          justifyContent: { xs: "center", sm: "flex-end" },
        },
        ".MuiTablePagination-spacer": {
          display: { xs: "none", sm: "block" },
        },
        ".MuiTablePagination-selectLabel, .MuiTablePagination-input": {
          display: { xs: "none", sm: "block" },
        },
      }}
    />
  );
}

function ActionChip({ action }: { action: AuditAction_t }) {
  return (
    <Chip
      size="small"
      label={actionLabel(action)}
      color={ACTION_COLORS[action]}
    />
  );
}

function ChangedFieldChips({ fields }: { fields: string[] }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {fields.slice(0, 3).map((field) => (
        <Chip key={field} size="small" variant="outlined" label={field} />
      ))}
      {fields.length > 3 && (
        <Chip size="small" label={`+${fields.length - 3}`} />
      )}
    </Stack>
  );
}

function actionLabel(action: AuditAction_t) {
  if (action === "CREATE") return "สร้าง";
  if (action === "UPDATE") return "แก้ไข";
  return "ลบ";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value);
}
