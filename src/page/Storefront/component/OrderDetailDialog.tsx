import UploadFileIcon from "@mui/icons-material/UploadFile";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  Paper,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useEffect, useState } from "react";
import type { ChangeEvent, ReactElement, Ref } from "react";
import { getStorefrontErrorMessage } from "../../../API/StorefrontService/Storefront";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { orderStatus_e } from "../../../enum";
import type {
  StorefrontOrder,
  StorefrontOrderEvidence,
} from "../type";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";

//*************************************************
// Types
//*************************************************
type OrderDetailDialogProps = {
  order: StorefrontOrder | null;
  onClose: () => void;
  onEvidenceUpload?: (
    orderID: string,
    evidence: StorefrontOrderEvidence,
  ) => Promise<void>;
  onCancelOrder?: (orderID: string) => Promise<void>;
};

type OrderEvidenceProps = {
  order: StorefrontOrder;
  onUpload?: (
    orderID: string,
    evidence: StorefrontOrderEvidence,
  ) => Promise<void>;
};

const MAX_EVIDENCE_SIZE = 2 * 1024 * 1024;

function OrderEvidence({ order, onUpload }: OrderEvidenceProps) {
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const evidence = order.confirmationEvidence;
  const canEdit = Boolean(onUpload) && (
    order.status === orderStatus_e.Submitted
    || order.status === orderStatus_e.PaymentNotified
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUpload) return;

    if (file.size > MAX_EVIDENCE_SIZE) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      setError("");
      setIsUploading(true);
      try {
        await onUpload(order.id, {
          fileName: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
        });
      } catch (uploadError) {
        setError(getStorefrontErrorMessage(uploadError));
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => setError("ไม่สามารถอ่านไฟล์หลักฐานได้");
    reader.readAsDataURL(file);
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
                แก้ไขล่าสุด {new Date(evidence.updatedAt).toLocaleString("th-TH")}
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
          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={isUploading}
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
              onChange={handleFileChange}
            />
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

//*************************************************
// Transition
//*************************************************
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<unknown> },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//*************************************************
// Main component
//*************************************************
export function OrderDetailDialog({
  order,
  onClose,
  onEvidenceUpload,
  onCancelOrder,
}: OrderDetailDialogProps) {
  const [actionError, setActionError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setActionError("");
    setIsCancelling(false);
  }, [order?.id]);

  async function handleCancelOrder() {
    if (!order || !onCancelOrder) return;

    const isConfirmed = window.confirm(
      `ยืนยันการยกเลิกคำสั่งซื้อ ${order.id} หรือไม่`,
    );
    if (!isConfirmed) return;

    setActionError("");
    setIsCancelling(true);
    try {
      await onCancelOrder(order.id);
    } catch (cancelError) {
      setActionError(getStorefrontErrorMessage(cancelError));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Dialog
      fullScreen
      open={order !== null}
      onClose={onClose}
      aria-label="รายละเอียดคำสั่งซื้อ"
      slots={{ transition: Transition }}
    >
      <HeaderDialog
        label="รายละเอียดคำสั่งซื้อ"
        onClick={onClose}
        position="sticky"
      />

      {order && (
        <Container maxWidth="md" className="storefront-content">
          <Stack spacing={2}>
            <OrderSummary
              id={order.id}
              date={order.date}
              status={order.status}
            />
            <OrderItems items={order.items} totalAmount={order.totalAmount} />
            <OrderEvidence
              key={order.id}
              order={order}
              onUpload={onEvidenceUpload}
            />
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {order.status === orderStatus_e.Submitted && onCancelOrder && (
              <Button
                color="error"
                variant="outlined"
                size="large"
                startIcon={<CancelIcon />}
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? "กำลังยกเลิก" : "ยกเลิกคำสั่งซื้อ"}
              </Button>
            )}
          </Stack>
        </Container>
      )}
    </Dialog>
  );
}
