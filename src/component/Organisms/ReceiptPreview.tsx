import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import Label_parameter from "../Atoms/Label_parameter";

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  customerName: string;
  customerAddress: string;
  taxId: string;
  orderNumber: string;
  date: string;
  items: ReceiptItem[];
}

interface Props {
  data: ReceiptData;
}

const ReceiptPreview: React.FC<Props> = ({ data }) => {
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: 32,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Typography variant="h4" align="center" gutterBottom>
        ใบเสร็จรับเงิน (Receipt)
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Store Info */}
      <Grid container spacing={1}>
        <Grid size={8}>
          <Label_parameter
            label="ลูกค้า:"
            value={data.customerName}
            gap="8px"
          />
        </Grid>
        <Grid size={4}>
          <Label_parameter label="เลขที่:" value={data.orderNumber} gap="8px" />
        </Grid>
        <Grid size={8}>
          <Label_parameter
            label="ที่อยู่:"
            value={data.customerAddress}
            gap="8px"
          />
        </Grid>
        <Grid size={4}>
          <Label_parameter label="วันที่:" value={data.date} gap="8px" />
        </Grid>
        <Grid size={12}>
          <Label_parameter
            label="เลขผู้เสียภาษี:"
            value={data.taxId}
            gap="8px"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>สินค้า</strong>
              </TableCell>
              <TableCell align="right">
                <strong>จำนวน</strong>
              </TableCell>
              <TableCell align="right">
                <strong>ราคา/หน่วย</strong>
              </TableCell>
              <TableCell align="right">
                <strong>รวม</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.qty}</TableCell>
                <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                <TableCell align="right">
                  {(item.qty * item.price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}

            {/* Summary */}
            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>
                <strong>Subtotal</strong>
              </TableCell>
              <TableCell align="right">{subtotal.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2}>
                <strong>VAT 7%</strong>
              </TableCell>
              <TableCell align="right">{vat.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2}>
                <strong>Total</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{total.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReceiptPreview;
