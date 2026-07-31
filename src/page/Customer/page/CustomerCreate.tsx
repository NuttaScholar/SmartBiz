import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import LaunchIcon from "@mui/icons-material/Launch";
import KeyIcon from "@mui/icons-material/Key";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCustomerLink,
  deleteCustomerLink,
  disableCustomerLink,
  getCustomerLink,
  getStorefrontErrorMessage,
  rotateCustomerToken,
  StorefrontApiError,
} from "../../../API/StorefrontService/Storefront";
import type { CustomerLink } from "../../../API/StorefrontService/Storefront";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { useAuth } from "../../../hooks/useAuth";
import { redirectToLogin } from "../../../lib/authRedirect";
import { storefrontAdminWithRetry } from "../lib/storefrontAdminWithRetry";

function getLinkUrl(link: CustomerLink): string {
  return new URL(link.path, window.location.origin).toString();
}

export default function Page_CustomerCreate() {
  const authContext = useAuth();
  const navigate = useNavigate();
  const { customerID: customerIDParam = "" } =
    useParams<{ customerID: string }>();
  const [customerID, setCustomerID] = React.useState(customerIDParam);
  const [customerLink, setCustomerLink] =
    React.useState<CustomerLink | null>(null);
  const [hasCheckedLink, setHasCheckedLink] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const isCustomerLocked = Boolean(customerIDParam);

  React.useEffect(() => {
    setCustomerID(customerIDParam);
  }, [customerIDParam]);

  const handleError = React.useCallback(
    (requestError: unknown) => {
      if (
        requestError instanceof StorefrontApiError
        && requestError.status === 401
      ) {
        redirectToLogin(navigate);
        return;
      }

      setError(getStorefrontErrorMessage(requestError));
    },
    [navigate],
  );

  React.useEffect(() => {
    const normalizedCustomerID = customerID.trim();
    setCustomerLink(null);
    setHasCheckedLink(false);
    setError("");
    setMessage("");

    if (!normalizedCustomerID) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    storefrontAdminWithRetry(authContext, (accessToken) =>
      getCustomerLink(accessToken, normalizedCustomerID),
    )
      .then((link) => {
        if (active) {
          setCustomerLink(link);
          setHasCheckedLink(true);
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (
          requestError instanceof StorefrontApiError
          && requestError.status === 404
        ) {
          setCustomerLink(null);
          setHasCheckedLink(true);
          return;
        }
        handleError(requestError);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authContext, customerID, handleError]);

  async function createLink() {
    if (!customerID.trim()) return;

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const link = await storefrontAdminWithRetry(
        authContext,
        (accessToken) =>
          createCustomerLink(accessToken, customerID.trim()),
      );
      setCustomerLink(link);
      setHasCheckedLink(true);
      setMessage("สร้างลิงก์สำหรับลูกค้าเรียบร้อยแล้ว");
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function rotateToken() {
    if (!customerLink) return;
    if (
      !window.confirm(
        "ยืนยันการสร้าง Token ใหม่? ลิงก์เดิมของลูกค้าจะใช้งานไม่ได้ทันที",
      )
    ) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const link = await storefrontAdminWithRetry(
        authContext,
        (accessToken) =>
          rotateCustomerToken(accessToken, customerLink.customerID),
      );
      setCustomerLink(link);
      setMessage("สร้าง Token ใหม่เรียบร้อยแล้ว");
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function disableStorefront() {
    if (!customerLink || !customerLink.isActive) return;
    if (
      !window.confirm(
        "ยืนยันการปิดใช้งาน Storefront? ลูกค้าจะไม่สามารถเข้าใช้งานผ่านลิงก์ปัจจุบันได้ทันที",
      )
    ) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const link = await storefrontAdminWithRetry(
        authContext,
        (accessToken) =>
          disableCustomerLink(accessToken, customerLink.customerID),
      );
      setCustomerLink(link);
      setMessage("ปิดใช้งาน Storefront เรียบร้อยแล้ว");
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyLink() {
    if (!customerLink) return;

    try {
      await navigator.clipboard.writeText(getLinkUrl(customerLink));
      setError("");
      setMessage("คัดลอกลิงก์แล้ว");
    } catch {
      setMessage("");
      setError("ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกจากช่องลิงก์");
    }
  }

  async function deleteLink() {
    const normalizedCustomerID = customerIDParam.trim();
    if (!normalizedCustomerID) return;
    if (
      !window.confirm(
        `ยืนยันการลบสิทธิ์ Storefront ของลูกค้า ${normalizedCustomerID}? ข้อมูลนี้จะถูกลบถาวร`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setMessage("");
    try {
      await storefrontAdminWithRetry(authContext, (accessToken) =>
        deleteCustomerLink(accessToken, normalizedCustomerID),
      );
      navigate("/customer");
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <HeaderDialog
        label="ออก Token ให้ลูกค้า"
        onClick={() => navigate("/customer")}
      >
        {customerIDParam && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexGrow: 1,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="ลบสิทธิ์ Storefront"
              onClick={deleteLink}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <DeleteIcon />
              )}
            </IconButton>
          </Box>
        )}
      </HeaderDialog>
      <Container maxWidth="md" sx={{ py: 3, my: "56px" }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4">จัดการลูกค้า</Typography>
            <Typography color="text.secondary">
              สร้างและเปลี่ยน Token สำหรับมอบสิทธิ์เข้าถึงหน้า Storefront
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6">เลือกลูกค้า</Typography>
                <Typography variant="body2" color="text.secondary">
                  เลือกลูกค้าจากข้อมูลผู้ติดต่อเพื่อจัดการลิงก์ Storefront
                </Typography>
              </Box>

              <FieldContactAccess
                label="ลูกค้า"
                placeholder="เลือกรหัสลูกค้า"
                value={customerID}
                onChange={setCustomerID}
                onClear={() => setCustomerID("")}
                readonly={isCustomerLocked}
              />

              <Divider />

              {!customerID.trim() && (
                <Alert severity="info">
                  กรุณาเลือกลูกค้าที่ต้องการมอบสิทธิ์
                </Alert>
              )}

              {customerID.trim() && isLoading && (
                <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography color="text.secondary">
                    กำลังตรวจสอบสิทธิ์ Storefront
                  </Typography>
                </Stack>
              )}

              {customerID.trim()
                && !isLoading
                && hasCheckedLink
                && !customerLink && (
                <Stack spacing={2}>
                  <Alert severity="warning">
                    ลูกค้า {customerID} ยังไม่มีสิทธิ์เข้า Storefront
                  </Alert>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<KeyIcon />}
                    onClick={createLink}
                    disabled={isSaving}
                  >
                    {isSaving ? "กำลังสร้าง Token" : "สร้าง Token"}
                  </Button>
                </Stack>
              )}

              {customerLink && !isLoading && (
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Box>
                      <Typography variant="h6">
                        {customerLink.customerName}
                      </Typography>
                      <Typography color="text.secondary">
                        รหัสลูกค้า: {customerLink.customerID}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        customerLink.isActive
                          ? "เปิดใช้งาน Storefront แล้ว"
                          : "ปิดใช้งาน Storefront แล้ว"
                      }
                      color={customerLink.isActive ? "success" : "default"}
                    />
                  </Stack>

                  <TextField
                    label="ลิงก์ Storefront"
                    value={getLinkUrl(customerLink)}
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<ContentCopyIcon />}
                      onClick={copyLink}
                      disabled={!customerLink.isActive || isSaving}
                    >
                      คัดลอกลิงก์
                    </Button>
                    <Button
                      component="a"
                      href={getLinkUrl(customerLink)}
                      target="_blank"
                      rel="noreferrer"
                      variant="outlined"
                      startIcon={<LaunchIcon />}
                      aria-disabled={!customerLink.isActive || isSaving}
                      onClick={(event) => {
                        if (!customerLink.isActive || isSaving) {
                          event.preventDefault();
                        }
                      }}
                      sx={
                        !customerLink.isActive || isSaving
                          ? { pointerEvents: "none", opacity: 0.5 }
                          : undefined
                      }
                    >
                      เปิด Storefront
                    </Button>
                    <Button
                      color="warning"
                      variant="outlined"
                      startIcon={<RestartAltIcon />}
                      onClick={rotateToken}
                      disabled={isSaving}
                    >
                      {isSaving ? "กำลังเปลี่ยน Token" : "Rotate Token"}
                    </Button>
                    {customerLink.isActive && (
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<BlockIcon />}
                        onClick={disableStorefront}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? "กำลังปิดใช้งาน"
                          : "ปิดใช้งาน Storefront"}
                      </Button>
                    )}
                  </Stack>

                  <Alert severity="info">
                    {customerLink.isActive
                      ? "เมื่อ Rotate Token ลิงก์เดิมจะหมดสิทธิ์ทันที และต้องส่งลิงก์ใหม่ให้ลูกค้า"
                      : "Storefront ถูกปิดใช้งาน ลูกค้าจะเข้าใช้งานผ่านลิงก์นี้ไม่ได้ สามารถ Rotate Token เพื่อเปิดใช้งานอีกครั้ง"}
                  </Alert>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
