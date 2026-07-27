import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { CustomerLinkSummary } from "../../../API/StorefrontService/Storefront";

type CustomerCardProps = {
  value: CustomerLinkSummary;
  variant?: "readonly" | "editable";
  onClick?: (edit: boolean, value: CustomerLinkSummary) => void;
};

export default function CustomerCard({
  value,
  variant = "readonly",
  onClick,
}: CustomerCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        width: "100%",
        maxWidth: 420,
        minHeight: 150,
      }}
    >
      <CardActionArea
        onClick={() => onClick?.(false, value)}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            width: 104,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.light",
          }}
        >
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
            <PersonIcon fontSize="large" />
          </Avatar>
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="h6">{value.customerName}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {value.customerID}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                color={value.isActive ? "success" : "default"}
                label={value.isActive ? "Token เปิดใช้งาน" : "Token ปิดใช้งาน"}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`ส่วนลด ${value.productDiscounts.length} รายการ`}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              คลิกการ์ดเพื่อจัดการส่วนลด
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {variant === "editable" && (
        <Box sx={{ py: 0.5 }}>
          <IconButton
            aria-label={`จัดการ Token ของ ${value.customerName}`}
            onClick={() => onClick?.(true, value)}
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Card>
  );
}
