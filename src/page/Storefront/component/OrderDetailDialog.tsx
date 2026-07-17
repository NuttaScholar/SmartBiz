import { Container, Dialog, Slide, Stack } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import type { ReactElement, Ref } from "react";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import type { StorefrontOrder } from "../type";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";

//*************************************************
// Types
//*************************************************
type OrderDetailDialogProps = {
  order: StorefrontOrder | null;
  onClose: () => void;
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
export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
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
          </Stack>
        </Container>
      )}
    </Dialog>
  );
}
