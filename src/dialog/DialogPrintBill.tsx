import React, { useRef } from 'react'
import { Button, Dialog, Paper, Slide, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions';
import PrintIcon from '@mui/icons-material/Print';
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { Bill_t } from '../dataSet/DataBill';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { 
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface myProps {
  open: boolean;
  bill: Bill_t;
  onClose: () => void;
}

const DialogPrintBill: React.FC<myProps> = (props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const styleTags = Array.from(document.querySelectorAll("style[data-emotion]"))
      .map(style => style.outerHTML)
      .join("");

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
          ${styleTags}
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background: #0078D4;
              color: white;
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        TransitionComponent={Transition}
    >
        <HeaderDialog label="ปริ้นบิล" onClick={props.onClose}/>

        <Stack
          ref={printRef}
          direction='column'
          justifyContent='center'
          gap={2}
          sx={{
            width: "100%",
            maxWidth: { md: "50%" },
            mx: "auto",
            mt: 4,
          }}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h5'>ใบเสร็จ/ใบสั่งซื้อ</Typography>

            <Typography 
              variant='subtitle1' 
              sx={{
                color: 
                  props.bill.status === 0 ? "red" :
                  props.bill.status === 1 ? "green" :
                  props.bill.status === 2 ? "orange" :
                  props.bill.status === 3 ? "blue" :
                  "inherit"
              }}
            >
              {props.bill.status === 0 && "รอการชำระเงิน"}
              {props.bill.status === 1 && "ชำระเงินแล้ว"}
              {props.bill.status === 2 && "ที่ต้องส่ง"}
              {props.bill.status === 3 && "จัดส่งสำเร็จ"}
            </Typography>
          </Stack>
          

          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{
              width: "100%",
            }}
          >
            <Stack direction='row' alignItems='center' gap={1}>
              <Typography variant='h6'>เลขที่ใบสั่งซื้อ:</Typography>
              <Typography variant='subtitle1'>{props.bill.no}</Typography>
            </Stack>
            <Stack direction='row' alignItems='center' gap={1}>
              <Typography variant='h6'>วันที่สั่งซื้อ:</Typography>
              <Typography variant='subtitle1'>
                {props.bill.date.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </Typography>
            </Stack>
          </Stack>

          

          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              height: "auto",
              border: "1px solid #000",
            }}
          >
            <Table 
              sx={{
                width: "100%",
              }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow
                  sx={{
                    background: "#0078D4",
                  }}
                >
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    No.
                  </TableCell>
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    รหัสสินค้า
                  </TableCell>
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    ชื่อสินค้า
                  </TableCell>
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    จำนวน
                  </TableCell>
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    หน่วยละ
                  </TableCell>
                  <TableCell 
                    sx={{
                      padding: "6px 16px",
                      background: "#0078D4",
                      color: "#fff",
                    }}
                  >
                    รวม
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.bill.products?.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      backgroundColor: "#fff",
                      '&:not(:last-child)': {
                        borderBottom: '1px solid #e0e0e0'
                      }
                    }}
                  >
                    <TableCell sx={{ borderRight: 0 }}>{index + 1}</TableCell>
                    <TableCell sx={{ borderRight: 0 }}>{row._id}</TableCell>
                    <TableCell sx={{ borderRight: 0 }}>{row.name}</TableCell>
                    <TableCell sx={{ borderRight: 0 }}>{row.quantity}</TableCell>
                    <TableCell sx={{ borderRight: 0 }}>{row.unit_price}</TableCell>
                    <TableCell sx={{ borderRight: 0 }}>{row.quantity * row.unit_price}</TableCell>
                  </TableRow>
                ))}
                {props.bill.products?.length === 0 && (
                  <TableRow
                    sx={{ 
                      backgroundColor: "#fff",
                      '&:not(:last-child)': {
                        borderBottom: '1px solid #e0e0e0'
                      }
                    }}
                  >
                    <TableCell 
                      sx={{ borderRight: 0 }}
                      colSpan={6}
                    >
                      Noot have product.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction='column'
            alignItems='flex-end'
            justifyContent='space-between'
            sx={{
              width: "100%",
            }}
          >
            
            <Stack direction='row' alignItems='center' gap={1}>
              <Typography variant='h6'>ราคารวม</Typography>
              <Typography variant='subtitle1'>{props.bill.price} บาท</Typography>
            </Stack>
            
            <Stack direction='row' alignItems='center' justifyContent='flex-end' gap={1}>
              <Typography variant='h6'>ผู้สั่งซื้อ</Typography>
              <Typography variant='subtitle1'>{props.bill.billName}</Typography>
            </Stack>
          </Stack>

        </Stack>

        <Stack
          justifyContent="center"
          alignItems="center"
          gap="16px"
          sx={{
            flexDirection: {
              xs: "column",
              md: "row"
            },
            marginTop: "20px"
          }}
        >
          <Button 
            variant="contained"
            sx={{
              padding: "8px 70px"
            }}
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            PRINT
          </Button>
          <Button 
            variant='outlined'
            sx={{
              padding: "8px 70px"
            }}
            onClick={() => {props.onClose?.();}}
          >
            CANCLE
          </Button>
        </Stack>
        
    </Dialog>
  )
}

export default DialogPrintBill