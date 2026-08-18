import {
  Box,
  CardActionArea,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuditAction_t, LogAudit_t } from "../../../API/AccountService/type";

const ACTION_COLORS: Record<AuditAction_t, "success" | "warning" | "error"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "error",
};

interface MobileAuditHistoryListProps {
  logs: LogAudit_t[];
  loading: boolean;
  hasMore: boolean;
  onOpenDetail: (id: string) => void;
  onLoadMore: () => void;
}

export default function MobileAuditHistoryList({
  logs,
  loading,
  hasMore,
  onOpenDetail,
  onLoadMore,
}: MobileAuditHistoryListProps) {
  return (
    <Box sx={{ display: { xs: "block", md: "none" }, p: 1 }}>
      {loading && logs.length === 0 ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState />
      ) : (
        <InfiniteScroll
          dataLength={logs.length}
          next={onLoadMore}
          hasMore={hasMore}
          loader={<LoadingMore />}
          scrollThreshold={0.9}
          style={{ overflow: "visible" }}
        >
          <Stack spacing={1}>
            {logs.map((log) => (
              <MobileAuditHistoryCard
                key={log.id}
                log={log}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </Stack>
        </InfiniteScroll>
      )}
    </Box>
  );
}

function MobileAuditHistoryCard({
  log,
  onOpenDetail,
}: {
  log: LogAudit_t;
  onOpenDetail: (id: string) => void;
}) {
  return (
    <Paper elevation={4}>
      <CardActionArea
        onClick={() => onOpenDetail(log.id)}
        sx={{ p: 1.5, textAlign: "left" }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(log.occurredAt)}
            </Typography>
            <ActionChip action={log.action} />
          </Stack>

          <Box>
            <Typography variant="body1" fontWeight={500}>
              {log.actor.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {log.actor.type}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Transaction ID
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
            >
              {log.transactionId}
            </Typography>
          </Box>

          <Divider />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            <Amount label="ยอดก่อน" value={log.wallet.beforeAmount} />
            <Amount label="ยอดหลัง" value={log.wallet.afterAmount} />
          </Box>

          {log.changedFields.length > 0 && (
            <ChangedFieldChips fields={log.changedFields} />
          )}
        </Stack>
      </CardActionArea>
    </Paper>
  );
}

function LoadingState() {
  return (
    <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
      <CircularProgress size={32} />
    </Box>
  );
}

function LoadingMore() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

function EmptyState() {
  return (
    <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
      ไม่พบประวัติการทำรายการ
    </Typography>
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

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {formatMoney(value)}
      </Typography>
    </Box>
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
