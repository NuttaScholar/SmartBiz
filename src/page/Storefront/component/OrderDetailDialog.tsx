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
import { forwardRef, useState } from "react";
import type { ChangeEvent, ReactElement, Ref } from "react";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { orderStatus_e } from "../../../enum";
import type { StorefrontOrder } from "../type";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";

//*************************************************
// Types
//*************************************************
type OrderDetailDialogProps = {
  order: StorefrontOrder | null;
  onClose: () => void;
  onOrderChange?: (order: StorefrontOrder) => void;
};

type OrderEvidenceProps = {
  order: StorefrontOrder;
  onChange?: (order: StorefrontOrder) => void;
};

const MAX_EVIDENCE_SIZE = 2 * 1024 * 1024;

function OrderEvidence({ order, onChange }: OrderEvidenceProps) {
  const [error, setError] = useState("");
  const evidence = order.confirmationEvidence;
  const canEdit = Boolean(onChange) && (
    order.status === orderStatus_e.Submitted
    || order.status === orderStatus_e.PaymentNotified
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onChange) return;

    if (file.size > MAX_EVIDENCE_SIZE) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setError("");
      onChange({
        ...order,
        confirmationEvidence: {
          fileName: file.name,
          mimeType: file.type,
          dataUrl: reader.result,
          updatedAt: new Date().toISOString(),
        },
      });
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
          <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
            {evidence ? "เปลี่ยนไฟล์หลักฐาน" : "เพิ่มไฟล์หลักฐาน"}
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
  onOrderChange,
}: OrderDetailDialogProps) {
  function cancelOrder() {
    if (!order || !onOrderChange) return;

    const isConfirmed = window.confirm(
      `ยืนยันการยกเลิกคำสั่งซื้อ ${order.id} หรือไม่`,
    );
    if (!isConfirmed) return;

    onOrderChange({ ...order, status: orderStatus_e.Cancelled });
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
            <OrderEvidence order={order} onChange={onOrderChange} />
            {order.status === orderStatus_e.Submitted && onOrderChange && (
              <Button
                color="error"
                variant="outlined"
                size="large"
                startIcon={<CancelIcon />}
                onClick={cancelOrder}
              >
                ยกเลิกคำสั่งซื้อ
              </Button>
            )}
          </Stack>
        </Container>
      )}
    </Dialog>
  );
}
