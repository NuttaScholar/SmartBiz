import React from 'react'
import { Button, Dialog, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { tableHeadCellStyle } from './DialogAddBill';
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { newProductBill } from '../page/Bill';

interface myProps {
    open: boolean;
    products_bill: newProductBill[];
    onClose: () => void;
    setTempproductBillList: (products: newProductBill[]) => void;
    handleProductQuantity: (quantity: number, index: number) => void;
    handleSetProductQuantityConfirm: () => void;
}

const DialogProductQuantity: React.FC<myProps> = (props) => {

  return (
    <Dialog 
        fullScreen
        open={props.open}
        onClose={props.onClose}
    >
        <HeaderDialog label="ระบุจำนวนสินค้าที่ต้องการ" onClick={props.onClose}/>
        <TableContainer
            component={Paper}
            sx={{
                width: { md: "900px", xs: "100%"},
                height: "626px",
                margin: "auto",
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
                        <TableCell sx={tableHeadCellStyle}>No.</TableCell>
                        <TableCell sx={tableHeadCellStyle}>รหัสสินค้า</TableCell>
                        <TableCell sx={tableHeadCellStyle}>ชื่อสินค้า</TableCell>
                        <TableCell sx={tableHeadCellStyle}>คงเหลือ</TableCell>
                        <TableCell sx={tableHeadCellStyle}>หน่วยละ</TableCell>
                        <TableCell sx={tableHeadCellStyle}>ราคารวม</TableCell>
                        <TableCell sx={tableHeadCellStyle}>จำนวนที่ต้องการ</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.products_bill.map((row, index) => (
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
                            <TableCell sx={{ borderRight: 0 }}>{row.product._id}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.product.name}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.product.quantity}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.product.unit_price}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}> {row.product.unit_price * row.quantity || 0} </TableCell>
                            <TableCell sx={{ borderRight: 0 }}>
                                <TextField
                                    id="outlined-number"
                                    label="Number"
                                    type="number"
                                    slotProps={{
                                        inputLabel: 
                                        {
                                            shrink: true,
                                        },
                                    }}
                                    required
                                    value={row.quantity}
                                    onChange={(e) => props.handleProductQuantity(parseInt(e.target.value), index)}
                                />
                            </TableCell>
                            
                        </TableRow>
                    ))}

                    {props.products_bill.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                ราคารวมทั้งหมด {`\t`} 
                                {props.products_bill.reduce((total, product) => {
                                    return total + product.product.unit_price * product.quantity;
                                }, 0).toFixed(2)}
                                {`\t`} บาท
                            </TableCell>
                        </TableRow>
                    )}

                    {props.products_bill.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                ไม่พบรายการสินค้า
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer> 

        <Stack
            justifyContent="center"
            alignItems="center"
            gap="16px"
            sx={{
                marginTop: "16px",
                flexDirection: {
                    xs: "column",
                    md: "row"
                }
            }}
        >
            <Button 
                variant="contained"
                sx={{
                    padding: "8px 70px"
                }}
                onClick={() => props.handleSetProductQuantityConfirm()}
            >
                CONFIRM
            </Button>
            <Button 
                variant='outlined'
                sx={{
                    padding: "8px 70px"
                }}
                onClick={() => {
                    props.setTempproductBillList([]);
                    props.onClose();
                }}
            >
                CANCLE
            </Button>
        </Stack>
    </Dialog>
  )
}

export default DialogProductQuantity