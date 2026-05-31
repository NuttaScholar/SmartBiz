import React from "react";
import {
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total?: number;
  discountPercent?: number;
}

export interface ReceiptData {
  customerName: string;
  customerID: string;
  customerAddress?: string;
  customerTaxID?: string;
  orderNumber: string;
  billDate: string;
  orderDate: string;
  items: ReceiptItem[];
  total: number;
}

interface Props {
  data: ReceiptData;
  documentTitle?: string;
}

const currencyFormat = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

function formatDiscountPercent(value?: number) {
  return value === undefined ? "-" : `${value.toFixed(2)}%`;
}

const ReceiptPreview: React.FC<Props> = ({ data, documentTitle = "ใบสั่งซื้อ" }) => {
  const subtotal = data.items.reduce(
    (sum, item) => sum + (item.total ?? item.qty * item.price),
    0,
  );
  const total = data.total || subtotal;

  return (
    <Box
      sx={{
        bgcolor: "white",
        p: { xs: 3, sm: 5 },
        maxWidth: 900,
        mx: "auto",
        color: "#111827",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 3,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {documentTitle}
          </Typography>
          <Typography color="text.secondary">Order Summary</Typography>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography sx={{ fontWeight: 700 }}>SmartBiz</Typography>
          <Typography variant="body2" color="text.secondary">
            เอกสารสำหรับตรวจสอบคำสั่งซื้อ
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <Typography variant="caption" color="text.secondary">
            ลูกค้า
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{data.customerName}</Typography>
          {data.customerAddress && (
            <Typography color="text.secondary">
              ที่อยู่: {data.customerAddress}
            </Typography>
          )}
          {data.customerTaxID && (
            <Typography color="text.secondary">
              เลขผู้เสียภาษี: {data.customerTaxID}
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "6px 16px",
              justifyContent: { sm: "end" },
            }}
          >
            <Typography color="text.secondary">เลขที่</Typography>
            <Typography sx={{ fontWeight: 700 }}>{data.orderNumber}</Typography>
            <Typography color="text.secondary">วันที่ออกบิล</Typography>
            <Typography>{data.billDate}</Typography>
            <Typography color="text.secondary">วันที่สั่งซื้อ</Typography>
            <Typography>{data.orderDate}</Typography>
          </Box>
        </Grid>
      </Grid>

      <TableContainer sx={{ mt: 4, border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f3f4f6" }}>
              <TableCell sx={{ fontWeight: 700 }}>สินค้า</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                จำนวน
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                ราคา/หน่วย
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                ส่วนลด
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                รวม
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((item, index) => {
              const lineTotal = item.total ?? item.qty * item.price;

              return (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">
                    {currencyFormat.format(item.price)}
                  </TableCell>
                  <TableCell align="right">
                    {formatDiscountPercent(item.discountPercent)}
                  </TableCell>
                  <TableCell align="right">
                    {currencyFormat.format(lineTotal)}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={3} />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                ยอดรวม
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {currencyFormat.format(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ width: 240, textAlign: "center" }}>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            ผู้รับผิดชอบ
          </Typography>
        </Box>
      </Box>

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ReceiptPreview;
