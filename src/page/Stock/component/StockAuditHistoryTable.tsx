import {
  Box,
  CardActionArea,
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
import InfiniteScroll from "react-infinite-scroll-component";
import {
  AuditOperation_t,
  LogAudit_t,
} from "../../../API/StockService/type";
import { stockAuditOperationLabel } from "../lib/stockAuditLabels";

interface Props {
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

const OPERATION_COLORS: Record<
  AuditOperation_t,
  "success" | "warning" | "error" | "info" | "default"
> = {
  PRODUCT_CREATE: "success",
  PRODUCT_UPDATE: "warning",
  PRODUCT_DELETE: "error",
  STOCK_IN: "info",
  STOCK_OUT: "default",
};

export default function StockAuditHistoryTable(props: Props) {
  const { logs, loading, total, hasMore, page, rowsPerPage } = props;
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
      <Box sx={{ display: { xs: "block", md: "none" }, p: 1 }}>
        {loading && logs.length === 0 ? (
          <StateMessage loading />
        ) : logs.length === 0 ? (
          <StateMessage />
        ) : (
          <InfiniteScroll
            dataLength={logs.length}
            next={() => props.onPageChange(page + 1)}
            hasMore={hasMore}
            loader={<StateMessage loading compact />}
            scrollThreshold={0.9}
            style={{ overflow: "visible" }}
          >
            <Stack spacing={1}>
              {logs.map((log) => (
                <MobileCard key={log.id} log={log} onOpen={props.onOpenDetail} />
              ))}
            </Stack>
          </InfiniteScroll>
        )}
      </Box>

      <TableContainer
        sx={{
          display: { xs: "none", md: "block" },
          maxHeight: "calc(100vh - 330px)",
          minHeight: 240,
        }}
      >
        <Table stickyHeader sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "secondary.main" }}>วันและเวลา</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }}>รายการ</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }}>สินค้า</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }}>เลขอ้างอิง</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }}>ผู้ดำเนินการ</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }} align="right">จำนวนก่อน</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }} align="right">จำนวนหลัง</TableCell>
              <TableCell sx={{ bgcolor: "secondary.main" }}>ข้อมูลที่เปลี่ยน</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8, color: "text.secondary" }}>
                  ไม่พบประวัติการทำรายการ
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  hover
                  key={log.id}
                  onClick={() => props.onOpenDetail(log.id)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{formatDateTime(log.occurredAt)}</TableCell>
                  <TableCell><OperationChip operation={log.operation} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{productName(log)}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.productID}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: log.stockLog?.reference ? "monospace" : undefined }}
                    >
                      {stockReference(log)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.actor.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.actor.type}</Typography>
                  </TableCell>
                  <TableCell align="right">{formatAmount(log.productBefore?.amount)}</TableCell>
                  <TableCell align="right">{formatAmount(log.productAfter?.amount)}</TableCell>
                  <TableCell><ChangedFields fields={log.changedFields} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_event, nextPage) => props.onPageChange(nextPage)}
        onRowsPerPageChange={(event) =>
          props.onRowsPerPageChange(Number(event.target.value))
        }
        sx={{ display: { xs: "none", md: "block" } }}
      />
    </Paper>
  );
}

function MobileCard({ log, onOpen }: { log: LogAudit_t; onOpen: (id: string) => void }) {
  return (
    <Paper elevation={4}>
      <CardActionArea onClick={() => onOpen(log.id)} sx={{ p: 1.5, textAlign: "left" }}>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(log.occurredAt)}
            </Typography>
            <OperationChip operation={log.operation} />
          </Stack>
          <Box>
            <Typography variant="body1" fontWeight={500}>{productName(log)}</Typography>
            <Typography variant="caption" color="text.secondary">{log.productID}</Typography>
          </Box>
          {log.stockLog?.reference && (
            <Box>
              <Typography variant="caption" color="text.secondary">เลขอ้างอิง</Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>
                {log.stockLog.reference}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
            <Amount label="จำนวนก่อน" value={log.productBefore?.amount} />
            <Amount label="จำนวนหลัง" value={log.productAfter?.amount} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            โดย {log.actor.name} ({log.actor.type})
          </Typography>
          <ChangedFields fields={log.changedFields} />
        </Stack>
      </CardActionArea>
    </Paper>
  );
}

function StateMessage({ loading = false, compact = false }: { loading?: boolean; compact?: boolean }) {
  return (
    <Box sx={{ display: "grid", minHeight: compact ? 56 : 240, placeItems: "center" }}>
      {loading ? <CircularProgress size={compact ? 28 : 32} /> : (
        <Typography color="text.secondary">ไม่พบประวัติการทำรายการ</Typography>
      )}
    </Box>
  );
}

function OperationChip({ operation }: { operation: AuditOperation_t }) {
  return <Chip size="small" label={stockAuditOperationLabel(operation)} color={OPERATION_COLORS[operation]} />;
}

function ChangedFields({ fields }: { fields: string[] }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {fields.slice(0, 3).map((field) => (
        <Chip key={field} size="small" variant="outlined" label={field} />
      ))}
      {fields.length > 3 && <Chip size="small" label={`+${fields.length - 3}`} />}
    </Stack>
  );
}

function Amount({ label, value }: { label: string; value?: number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{formatAmount(value)}</Typography>
    </Box>
  );
}

function productName(log: LogAudit_t) {
  return log.productAfter?.name || log.productBefore?.name || "ไม่ทราบชื่อสินค้า";
}

function stockReference(log: LogAudit_t) {
  return log.stockLog?.reference || "-";
}

function formatAmount(value?: number) {
  return value === undefined ? "-" : new Intl.NumberFormat("th-TH").format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
