import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { PaperProps, TypographyProps } from "@mui/material";
import type { ReactNode } from "react";

const AUDIT_PAPER_PROPS = {
  variant: "elevation",
  elevation: 6,
} as const;

export function AuditPaper(props: PaperProps) {
  return <Paper {...props} {...AUDIT_PAPER_PROPS} />;
}

interface AuditDetailDialogFrameProps {
  open: boolean;
  title: string;
  badge: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

export function AuditDetailDialogFrame({
  open,
  title,
  badge,
  onClose,
  children,
}: AuditDetailDialogFrameProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {open && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {badge}
              <Typography variant="h6">{title}</Typography>
            </Stack>
            <IconButton
              aria-label="ปิด"
              onClick={onClose}
              sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>{children}</Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

interface AuditInfoProps {
  label: string;
  value: string;
  mono?: boolean;
  variant?: TypographyProps["variant"];
}

export function AuditInfo({
  label,
  value,
  mono = false,
  variant = "body1",
}: AuditInfoProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={variant}
        sx={{
          overflowWrap: "anywhere",
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface AuditInfoGridProps {
  children: ReactNode;
  gap?: number;
}

export function AuditInfoGrid({ children, gap = 1 }: AuditInfoGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap,
      }}
    >
      {children}
    </Box>
  );
}

interface AuditChangedFieldsProps {
  fields: string[];
  emptyMessage?: string;
}

export function AuditChangedFields({
  fields,
  emptyMessage,
}: AuditChangedFieldsProps) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {fields.length
        ? fields.map((field) => (
            <Chip key={field} size="small" label={field} />
          ))
        : emptyMessage && (
            <Typography color="text.secondary">{emptyMessage}</Typography>
          )}
    </Stack>
  );
}

export function AuditComparisonGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        gap: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

interface AuditSnapshotCardProps {
  title: string;
  hasData: boolean;
  children: ReactNode;
}

export function AuditSnapshotCard({
  title,
  hasData,
  children,
}: AuditSnapshotCardProps) {
  return (
    <AuditPaper sx={{ p: 1.5 }}>
      <Typography variant="h6" fontWeight={500} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {hasData ? (
        children
      ) : (
        <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
      )}
    </AuditPaper>
  );
}
