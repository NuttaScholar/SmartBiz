import { Alert, Box, CircularProgress, Fab, useMediaQuery } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogAuditQuery_t, LogAudit_t } from "../../../API/AccountService/type";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { errorCode_e, role_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import { initPage } from "../../../lib/initPage";
import AuditDetailDialog from "../component/AuditDetailDialog";
import AuditHistorySearch, {
  AuditHistoryFilters_t,
} from "../component/AuditHistorySearch";
import AuditHistoryTable from "../component/AuditHistoryTable";
import accessWithRetry_f from "../lib/accessWithRetry";
import { GoToTop } from "../../../function/Window";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import theme from "../../../theme";

const EMPTY_FILTERS: AuditHistoryFilters_t = {
  transactionId: "",
  action: "",
  actorName: "",
  actorType: "",
  from: null,
  to: null,
};

export default function Page_AccessHistory() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [allowed, setAllowed] = React.useState(false);
  const [filters, setFilters] =
    React.useState<AuditHistoryFilters_t>(EMPTY_FILTERS);
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
          navigate("/access", { replace: true });
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
    return () => {
      active = false;
    };
  }, [authContext, navigate]);

  React.useEffect(() => {
    if (!allowed) return;
    let active = true;
    setLoading(true);
    setError("");

    accessWithRetry_f
      .queryLogAudit(authContext, toQuery(filters, page + 1, rowsPerPage))
      .then((response) => {
        if (!active) return;
        if (response.success && response.data) {
          const result = response.data;
          setLogs((currentLogs) =>
            isMobile && page > 0
              ? appendUniqueLogs(currentLogs, result.logs)
              : result.logs,
          );
          setTotal(result.total);
          setHasMore(result.hasMore);
          return;
        }
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return;
        setError(
          response.errCode === errorCode_e.PermissionDeniedError
            ? "เฉพาะผู้ดูแลระบบเท่านั้นที่ดูประวัติได้"
            : response.errCode !== undefined
              ? ErrorString(response.errCode)
              : "ไม่สามารถโหลดประวัติการทำรายการได้",
        );
      })
      .catch((requestError) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, requestError)) return;
        setError("ไม่สามารถเชื่อมต่อบริการบัญชีได้");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed, authContext, filters, isMobile, navigate, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [isMobile]);

  function handleSearch(nextFilters: AuditHistoryFilters_t) {
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
      const response = await accessWithRetry_f.getLogAudit(authContext, id);
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
      <HeaderDialog
        label="ประวัติการทำรายการ"
        onClick={() => navigate("/access")}
      />
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
        <AuditHistorySearch onSearch={handleSearch} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <AuditHistoryTable
          logs={logs}
          loading={loading}
          total={total}
          hasMore={hasMore}
          page={page}
          rowsPerPage={rowsPerPage}
          onOpenDetail={openDetail}
          onPageChange={setPage}
          onRowsPerPageChange={(nextRowsPerPage) => {
            setRowsPerPage(nextRowsPerPage);
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

      <AuditDetailDialog
        log={selected}
        onClose={() => setSelected(undefined)}
      />
      <Fab
        size="medium"
        color="primary"
        sx={{display: {xs: "flex", md: "none"}, position: "fixed", bottom: 16, right: 16 }}
        onClick={GoToTop}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </>
  );
}

function toQuery(
  filters: AuditHistoryFilters_t,
  page: number,
  size: number,
): LogAuditQuery_t {
  return {
    transactionId: filters.transactionId.trim() || undefined,
    action: filters.action || undefined,
    actorName: filters.actorName.trim() || undefined,
    actorType: filters.actorType || undefined,
    from: filters.from ?? undefined,
    to: filters.to ?? undefined,
    page,
    size,
  };
}

function appendUniqueLogs(currentLogs: LogAudit_t[], nextLogs: LogAudit_t[]) {
  const currentIds = new Set(currentLogs.map((log) => log.id));
  return [
    ...currentLogs,
    ...nextLogs.filter((log) => !currentIds.has(log.id)),
  ];
}
