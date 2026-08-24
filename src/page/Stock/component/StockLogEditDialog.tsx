import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import React from "react";
import { logInfo_t } from "../../../API/StockService/type";
import { stockLogType_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import stockWithRetry_f from "../lib/stockWithRetry";

type Props = {
  log?: logInfo_t;
  onClose: () => void;
  onSaved: () => void;
};

export default function StockLogEditDialog({ log, onClose, onSaved }: Props) {
  const authContext = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setAmount(log ? String(log.amount) : "");
    setPrice(log?.price !== undefined ? String(log.price) : "");
    setNote(log?.note ?? "");
    setError("");
  }, [log]);

  async function handleSave() {
    if (!log) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("จำนวนต้องมากกว่า 0");
      return;
    }

    let parsedPrice: number | null | undefined;
    if (log.type === stockLogType_e.in) {
      parsedPrice = price.trim() === "" ? null : Number(price);
      if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
        setError("ราคาต้องไม่น้อยกว่า 0");
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const response = await stockWithRetry_f.putLog(authContext, {
        id: log.id,
        amount: parsedAmount,
        ...(log.type === stockLogType_e.in
          ? { price: parsedPrice }
          : { note: note.trim() || null }),
      });
      if (response.success) {
        onSaved();
        return;
      }
      if (redirectToLoginOnAuthError(navigate, response.errCode)) return;
      setError(
        response.errCode !== undefined
          ? ErrorString(response.errCode)
          : "ไม่สามารถแก้ไขรายการได้",
      );
    } catch (requestError) {
      if (!redirectToLoginOnThrownAuthError(navigate, requestError)) {
        setError("ไม่สามารถเชื่อมต่อบริการสต็อกได้");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(log)} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        แก้ไขรายการ{log?.type === stockLogType_e.in ? "เติมสต็อก" : "ตัดสต็อก"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            required
            fullWidth
            type="number"
            label="จำนวน"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            slotProps={{ htmlInput: { min: 0.01, step: "any" } }}
          />
          {log?.type === stockLogType_e.in ? (
            <TextField
              fullWidth
              type="number"
              label="ราคา"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
            />
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="หมายเหตุ"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving} variant="contained">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
