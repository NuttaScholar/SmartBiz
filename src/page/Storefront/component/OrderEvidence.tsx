import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useState, type ChangeEvent } from "react";
import { getStorefrontErrorMessage } from "../../../API/StorefrontService/Storefront";
import { orderSource_e, orderStatus_e } from "../../../enum";
import type { StorefrontOrder, StorefrontOrderEvidence } from "../type";
import { DialogAlert } from "./DialogAlert";

type OrderEvidenceProps = {
  order: StorefrontOrder;
  onUpload?: (
    orderID: string,
    evidence: StorefrontOrderEvidence,
  ) => Promise<void>;
};

const MAX_EVIDENCE_SIZE = 2 * 1024 * 1024;

export function OrderEvidence({ order, onUpload }: OrderEvidenceProps) {
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [pendingEvidence, setPendingEvidence] = useState<StorefrontOrderEvidence | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const evidence = pendingEvidence ?? order.confirmationEvidence;
  const canEdit = Boolean(onUpload) && (
    (order.source === orderSource_e.Direct
    || order.status === orderStatus_e.Submitted
    || order.status === orderStatus_e.PaymentNotified)
    &&order.status !== orderStatus_e.Completed
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUpload || !canEdit || isUploading || isReading) return;

    setPendingEvidence(null);

    if (file.size > MAX_EVIDENCE_SIZE) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 2 MB");
      return;
    }

    setError("");
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPendingEvidence({
        fileName: file.name,
        mimeType: file.type,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => setError("ไม่สามารถอ่านไฟล์หลักฐานได้");
    reader.onloadend = () => setIsReading(false);
    reader.readAsDataURL(file);
  }

  async function handleConfirmUpload() {
    if (!onUpload || !pendingEvidence || !canEdit || isUploading || isReading) return;

    setError("");
    setIsUploading(true);
    try {
      await onUpload(order.id, pendingEvidence);
      setPendingEvidence(null);
      setShowSuccess(true);
    } catch (uploadError) {
      setError(getStorefrontErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Paper variant="outlined" className="detail-panel">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6">หลักฐานยืนยันคำสั่งซื้อ</Typography>
          <Typography variant="body2" color="text.secondary">
            รองรับไฟล์รูปภาพหรือ PDF ขนาดไม่เกิน 2 MB
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {evidence ? (
          <Stack spacing={1.5}>
            {evidence.mimeType.startsWith("image/") && (
              <Box
                component="img"
                src={evidence.dataUrl}
                alt={`หลักฐาน ${evidence.fileName}`}
                sx={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "contain",
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              />
            )}
            <Box>
              <Typography fontWeight={600}>{evidence.fileName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {pendingEvidence
                  ? "ยังไม่ได้ส่งหลักฐาน กรุณากดยืนยัน"
                  : order.confirmationEvidence && `แก้ไขล่าสุด ${new Date(order.confirmationEvidence.updatedAt).toLocaleString("th-TH")}`}
              </Typography>
            </Box>
            <Button
              component="a"
              href={evidence.dataUrl}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
            >
              ดูหลักฐาน
            </Button>
          </Stack>
        ) : (
          <Typography color="text.secondary">ยังไม่มีหลักฐานยืนยันคำสั่งซื้อ</Typography>
        )}

        {canEdit && (
          <Stack spacing={1.5}>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadFileIcon />}
              disabled={isUploading || isReading}
            >
              {isUploading
                ? "กำลังอัปโหลด"
                : evidence
                  ? "เปลี่ยนไฟล์หลักฐาน"
                  : "เพิ่มไฟล์หลักฐาน"}
              <input
                hidden
                type="file"
                accept="image/*,application/pdf"
                disabled={isUploading || isReading}
                onChange={handleFileChange}
              />
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmUpload}
              disabled={!pendingEvidence || isUploading || isReading}
            >
              {isUploading ? "กำลังส่งหลักฐาน" : "ยืนยัน"}
            </Button>
          </Stack>
        )}
      </Stack>
      <DialogAlert open={showSuccess} onClose={() => setShowSuccess(false)} />
    </Paper>
  );
}

