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
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState, type ChangeEvent } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { orderSource_e } from "../../../enum";
import type { StorefrontOrder, StorefrontOrderEvidence } from "../../Storefront/type";

type PaymentEvidenceDialogProps = {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string;
  evidence: StorefrontOrder["confirmationEvidence"];
  source: orderSource_e;
  onUpload: (evidence: StorefrontOrderEvidence | { objectKey: string }) => Promise<void>;
};

export function PaymentEvidenceDialog({
  open,
  onClose,
  isLoading,
  error,
  evidence,
  source,
  onUpload,
}: PaymentEvidenceDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const uploading = useRef(false);
  const [objectKey, setObjectKey] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function handleUseExisting() {
    if (!objectKey.trim() || uploading.current || isLoading || source !== orderSource_e.Direct) return;
    uploading.current = true;
    setIsUploading(true);
    setUploadError("");
    setUploaded(false);
    setCopyMessage("");
    try {
      await onUpload({ objectKey: objectKey.trim() });
      setObjectKey("");
      setUploaded(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "ไม่สามารถใช้หลักฐานเดิมได้");
    } finally {
      uploading.current = false;
      setIsUploading(false);
    }
  }

  async function handleCopy() {
    if (!evidence?.objectKey) return;
    try {
      await navigator.clipboard.writeText(evidence.objectKey);
      setCopyMessage("คัดลอก objectKey แล้ว");
    } catch {
      setCopyMessage("คัดลอกไม่สำเร็จ กรุณาเลือกข้อความ objectKey แล้วคัดลอกด้วยตนเอง");
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading.current || source !== orderSource_e.Direct) return;
    setUploadError("");
    setUploaded(false);
    setCopyMessage("");
    if (file.size === 0 || file.size > 2 * 1024 * 1024) {
      setUploadError("กรุณาเลือกไฟล์ขนาดไม่เกิน 2 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"].includes(file.type)) {
      setUploadError("รองรับไฟล์รูปภาพ JPEG, PNG, GIF, WebP หรือ PDF เท่านั้น");
      return;
    }
    uploading.current = true;
    setIsUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
        reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
        reader.readAsDataURL(file);
      });
      await onUpload({ fileName: file.name, mimeType: file.type, dataUrl });
      setUploaded(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "อัปโหลดหลักฐานไม่สำเร็จ");
    } finally {
      uploading.current = false;
      setIsUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isUploading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="payment-evidence-title"
    >
      <DialogTitle id="payment-evidence-title">
        หลักฐานการชำระเงิน
      </DialogTitle>
      <DialogContent dividers>
        {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
        {uploaded && <Alert severity="success" sx={{ mb: 2 }}>บันทึกหลักฐานสำเร็จแล้ว</Alert>}
        {copyMessage && <Alert severity="info" sx={{ mb: 2 }}>{copyMessage}</Alert>}
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
                alt={`หลักฐาน ${evidence.objectKey}`}
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
                title={`หลักฐาน ${evidence.objectKey}`}
                sx={{ width: "100%", height: "70vh", border: 0 }}
              />
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">objectKey</Typography>
              <Typography fontWeight={600} sx={{ overflowWrap: "anywhere", userSelect: "text" }}>
                {evidence.objectKey || "ไม่พบ objectKey"}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ my: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  disabled={!evidence.objectKey}
                >
                  คัดลอก objectKey
                </Button>
                <Button
                  component="a"
                  href={evidence.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                >
                  เปิดหลักฐาน
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                อัปเดตล่าสุด{" "}
                {new Date(
                  evidence.updatedAt,
                ).toLocaleString("th-TH")}
              </Typography>
            </Box>
          </Stack>
        )}
        {source === orderSource_e.Direct && (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <TextField
              label="objectKey ของหลักฐานเดิม"
              value={objectKey}
              onChange={(event) => setObjectKey(event.target.value)}
              disabled={isLoading || isUploading}
              fullWidth
              helperText="วาง objectKey ของรูปภาพหรือ PDF ที่มีอยู่ในระบบ"
            />
            <Button variant="outlined" onClick={handleUseExisting} disabled={!objectKey.trim() || isLoading || isUploading}>
              ใช้หลักฐานเดิม
            </Button>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {source === orderSource_e.Direct && (
          <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={isLoading || isUploading}>
            {isUploading ? "กำลังอัปโหลด" : "อัปโหลดหลักฐาน"}
            <input hidden type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" disabled={isLoading || isUploading} onChange={handleFileChange} />
          </Button>
        )}
        <Button onClick={onClose} disabled={isUploading}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}
