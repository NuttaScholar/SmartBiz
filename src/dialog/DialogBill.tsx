import React from 'react'
import { TransitionProps } from '@mui/material/transitions';
import { Dialog, Paper, Slide, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { Bill_t } from '../dataSet/DataBill';
import Bill_Detail from '../component/Molecules/Bill_Detail';

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
    onClose?: () => void;
    bill: Bill_t | null;
}

const DialogBill: React.FC<myProps> = (props) => {
    if (!props.bill) return null;

    console.log(props.bill)
  return (
    <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        TransitionComponent={Transition}
    >
        <HeaderDialog label="รายละเอียด" onClick={props.onClose} />
        <Stack
          justifyContent="center"
          alignItems="center"
          gap="20px"
          sx={{
            marginTop: "16px"
          }}
        >
          <Bill_Detail bill={props.bill} />

          <TableContainer 
            component={Paper}
            sx={{
              width: "900px",
              height: "626px",
              border: "1px solid #000"
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
                  <TableCell sx={{ color: "#fff" }}>
                    No.
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>รหัสสินค้า</TableCell>
                  <TableCell sx={{ color: "#fff" }}>ชื่อสินค้า</TableCell>
                  <TableCell sx={{ color: "#fff" }}>จำนวน</TableCell>
                  <TableCell sx={{ color: "#fff" }}>หน่วยละ</TableCell>
                  <TableCell sx={{ color: "#fff" }}>รวม</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.bill.products?.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {index + 1}
                    </TableCell>
                    <TableCell>{row._id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.unit_price}</TableCell>
                    <TableCell>{row.total_amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        
    </Dialog>
  )
}

export default DialogBill