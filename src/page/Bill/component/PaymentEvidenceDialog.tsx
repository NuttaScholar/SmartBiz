import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import type { StorefrontOrder } from "../../Storefront/type";

type PaymentEvidenceDialogProps = {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string;
  evidence: StorefrontOrder["confirmationEvidence"];
};

export function PaymentEvidenceDialog({
  open,
  onClose,
  isLoading,
  error,
  evidence,
}: PaymentEvidenceDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="payment-evidence-title"
    >
      <DialogTitle id="payment-evidence-title">
        หลักฐานการชำระเงิน
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">กำลังโหลดหลักฐาน</Typography>
          </Stack>
        )}
        {!isLoading && error && (
          <Alert severity="error">{error}</Alert>
        )}
        {!isLoading
          && !error
          && !evidence && (
          <Typography color="text.secondary">
            ยังไม่มีหลักฐานการชำระเงิน
          </Typography>
        )}
        {!isLoading && evidence && (
          <Stack spacing={2}>
            {evidence.mimeType.startsWith("image/") && (
              <Box
                component="img"
                src={evidence.dataUrl}
                alt={`หลักฐาน ${evidence.fileName}`}
                sx={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              />
            )}
            {evidence.mimeType === "application/pdf" && (
              <Box
                component="iframe"
                src={evidence.dataUrl}
                title={`หลักฐาน ${evidence.fileName}`}
                sx={{ width: "100%", height: "70vh", border: 0 }}
              />
            )}
            <Box>
              <Typography fontWeight={600}>
                {evidence.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                อัปเดตล่าสุด{" "}
                {new Date(
                  evidence.updatedAt,
                ).toLocaleString("th-TH")}
              </Typography>
            </Box>
            <Button
              component="a"
              href={evidence.dataUrl}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
            >
              เปิดหลักฐาน
            </Button>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}
