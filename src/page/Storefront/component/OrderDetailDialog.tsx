import CancelIcon from "@mui/icons-material/Cancel";
import {
  Alert,
  Button,
  Container,
  Dialog,
  Slide,
  Stack,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useEffect, useState } from "react";
import type { ReactElement, Ref } from "react";
import { getStorefrontErrorMessage } from "../../../API/StorefrontService/Storefront";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { orderSource_e, orderStatus_e } from "../../../enum";
import type {
  StorefrontOrder,
  StorefrontOrderEvidence,
} from "../type";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";
import { OrderEvidence } from "./OrderEvidence";

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
              source={order.source}
            />
            <OrderItems items={order.items} totalAmount={order.totalAmount} />
            <OrderEvidence
              key={order.id}
              order={order}
              onUpload={onEvidenceUpload}
            />
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {order.source !== orderSource_e.Direct && order.status === orderStatus_e.Submitted && onCancelOrder && (
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
