import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Alert, Box, CircularProgress, Fab, useMediaQuery } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LogAuditQuery_t,
  LogAudit_t,
} from "../../../API/StockService/type";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { errorCode_e, role_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { GoToTop } from "../../../function/Window";
import { useAuth } from "../../../hooks/useAuth";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import { initPage } from "../../../lib/initPage";
import theme from "../../../theme";
import StockAuditDetailDialog from "../component/StockAuditDetailDialog";
import StockAuditHistorySearch, {
  StockAuditHistoryFilters_t,
} from "../component/StockAuditHistorySearch";
import StockAuditHistoryTable from "../component/StockAuditHistoryTable";
import stockWithRetry_f from "../lib/stockWithRetry";

const EMPTY_STOCK_AUDIT_FILTERS: StockAuditHistoryFilters_t = {
  productID: "",
  action: "",
  operation: "",
  actorName: "",
  actorType: "",
  from: null,
  to: null,
};

export default function Page_StockAudit() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [allowed, setAllowed] = React.useState(false);
  const [filters, setFilters] = React.useState<StockAuditHistoryFilters_t>(
    EMPTY_STOCK_AUDIT_FILTERS,
  );
  const [logs, setLogs] = React.useState<LogAudit_t[]>([]);
  const [selected, setSelected] = React.useState<LogAudit_t>();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    initPage(authContext)
      .then((auth) => {
        if (!active) return;
        if (auth.role !== role_e.admin) {
          navigate("/stock", { replace: true });
          return;
        }
        setAllowed(true);
      })
      .catch((requestError) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, requestError)) return;
        setError("ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้งานได้");
        setLoading(false);
      });
    return () => { active = false; };
  }, [authContext, navigate]);

  React.useEffect(() => {
    if (!allowed) return;
    let active = true;
    setLoading(true);
    setError("");

    stockWithRetry_f
      .queryLogAudit(authContext, toQuery(filters, page + 1, rowsPerPage))
      .then((response) => {
        if (!active) return;
        if (response.success && response.data) {
          setLogs((current) =>
            isMobile && page > 0
              ? appendUniqueLogs(current, response.data!.logs)
              : response.data!.logs,
          );
          setTotal(response.data.total);
          setHasMore(response.data.hasMore);
          return;
        }
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return;
        setError(
          response.errCode === errorCode_e.PermissionDeniedError
            ? "เฉพาะผู้ดูแลระบบเท่านั้นที่ดูประวัติได้"
            : response.errCode !== undefined
              ? ErrorString(response.errCode)
              : "ไม่สามารถโหลดประวัติสต็อกได้",
        );
      })
      .catch((requestError) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, requestError)) return;
        setError("ไม่สามารถเชื่อมต่อบริการสต็อกได้");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [allowed, authContext, filters, isMobile, navigate, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [isMobile]);

  function handleSearch(nextFilters: StockAuditHistoryFilters_t) {
    setPage(0);
    setLogs([]);
    setTotal(0);
    setHasMore(false);
    setFilters(nextFilters);
  }

  async function openDetail(id: string) {
    setDetailLoading(true);
    setError("");
    try {
      const response = await stockWithRetry_f.getLogAudit(authContext, id);
      if (response.success && response.data) {
        setSelected(response.data);
      } else if (!redirectToLoginOnAuthError(navigate, response.errCode)) {
        setError(
          response.errCode !== undefined
            ? ErrorString(response.errCode)
            : "ไม่สามารถโหลดรายละเอียดประวัติได้",
        );
      }
    } catch (requestError) {
      if (!redirectToLoginOnThrownAuthError(navigate, requestError)) {
        setError("ไม่สามารถโหลดรายละเอียดประวัติได้");
      }
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <>
      <HeaderDialog label="ประวัติการทำรายการสต็อก" onClick={() => navigate("/stock")} />
      <Box
        sx={{
          width: "100%",
          maxWidth: 1280,
          boxSizing: "border-box",
          mx: "auto",
          px: { xs: 1, sm: 2 },
          pt: { xs: 8, sm: 10 },
          pb: { xs: 2, sm: 5 },
        }}
      >
        <StockAuditHistorySearch onSearch={handleSearch} />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <StockAuditHistoryTable
          logs={logs}
          loading={loading}
          total={total}
          hasMore={hasMore}
          page={page}
          rowsPerPage={rowsPerPage}
          onOpenDetail={openDetail}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
        />
      </Box>

      {detailLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(255,255,255,.55)",
            zIndex: 1400,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <StockAuditDetailDialog log={selected} onClose={() => setSelected(undefined)} />
      <Fab
        size="medium"
        color="primary"
        sx={{ display: { xs: "flex", md: "none" }, position: "fixed", bottom: 16, right: 16 }}
        onClick={GoToTop}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </>
  );
}

function toQuery(
  filters: StockAuditHistoryFilters_t,
  page: number,
  size: number,
): LogAuditQuery_t {
  return {
    productID: filters.productID.trim() || undefined,
    action: filters.action || undefined,
    operation: filters.operation || undefined,
    actorName: filters.actorName.trim() || undefined,
    actorType: filters.actorType || undefined,
    from: filters.from ?? undefined,
    to: filters.to ?? undefined,
    page,
    size,
  };
}

function appendUniqueLogs(current: LogAudit_t[], next: LogAudit_t[]) {
  const currentIds = new Set(current.map((log) => log.id));
  return [...current, ...next.filter((log) => !currentIds.has(log.id))];
}
