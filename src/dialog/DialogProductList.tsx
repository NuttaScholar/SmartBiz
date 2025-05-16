import React from 'react'
import { Dialog, Paper, Slide, Stack, Table, TableCell, TableContainer, TableHead, TableRow, Checkbox, TableBody, Button, TextField } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { product_t } from '../dataSet/DataBill';
import { tableHeadCellStyle } from './DialogAddBill';
import { IndeterminateCheckBox } from '@mui/icons-material';

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
    selectedProductBill: product_t[],
    products: product_t[];
    onClose: () => void;
    setSelectedProductBill: (products: product_t[]) => void;
    handleSelectedNewProduct: (product?: product_t | undefined, all?: boolean) => void;
    handleProductListConfirm: () => void;
}

const DialogProductList: React.FC<myProps> = (props) => {
    const [ searchKey, setSearchKey ] = React.useState("");

    const filteredProducts = props.products.filter((product) => {
        const keyword = searchKey.toLowerCase();
        return (
            product._id.toLowerCase().includes(keyword) ||
            product.name.toLowerCase().includes(keyword)
        );
    });
    
  return (
    <Dialog 
        fullScreen
        open={props.open} 
        onClose={props.onClose}
        TransitionComponent={Transition}
    >
        <HeaderDialog label="เลือกสินค้า" onClick={props.onClose}/>
        
        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap={'24px'}
            sx={{
                width: "100%",
                marginTop: "8px"
            }}
        >
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                gap={'12px'}
                sx={{
                    width: { xs: "100%", sm: "360px" ,md: "360px" },
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#E0EFFF"
                }}
            >
                <TextField 
                    id="outlined-basic" 
                    label="รหัส/ชื่อสินค้า" 
                    variant="outlined"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    sx={{
                        width: "90%",
                        background: "#fff"
                    }} 
                />
            </Stack>

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
                        <TableCell sx={tableHeadCellStyle}>
                            <Stack
                            flexDirection="row"
                            alignItems="center"
                            gap={"12px"}
                            >
                            <Checkbox
                                checked={
                                    (props.products?.length || 0) > 0 &&
                                    props.selectedProductBill.length === props.products?.length
                                }
                                indeterminate={
                                    props.selectedProductBill.length > 0 &&
                                    props.selectedProductBill.length < (props.products?.length || 0)
                                }
                                indeterminateIcon={<IndeterminateCheckBox sx={{ color: "#fff" }} />}
                                onChange={() => props.handleSelectedNewProduct(undefined, true)}
                                sx={{
                                    color: "#fff",
                                    '&.Mui-checked': {
                                        color: "#fff"
                                    },
                                }}
                            />
                            No.
                            </Stack>
                        </TableCell>
                        <TableCell sx={tableHeadCellStyle}>รหัสสินค้า</TableCell>
                        <TableCell sx={tableHeadCellStyle}>ชื่อสินค้า</TableCell>
                        <TableCell sx={tableHeadCellStyle}>จำนวน</TableCell>
                        <TableCell sx={tableHeadCellStyle}>หน่วยละ</TableCell>
                        <TableCell sx={tableHeadCellStyle}>รวม</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredProducts.map((row, index) => (
                        <TableRow 
                            key={index}
                            sx={{ 
                            backgroundColor: "#fff",
                            '&:not(:last-child)': {
                                borderBottom: '1px solid #e0e0e0'
                            }
                            }}
                        >
                            <TableCell 
                            sx={{ 
                                display: "flex", 
                                alignItems: "center",
                                borderRight: 0 
                            }}
                            >
                            <Stack
                                flexDirection="row"
                                alignItems="center"
                                gap={"12px"}
                            >
                                <Checkbox 
                                    checked={props.selectedProductBill.some(p => p._id === row._id)}
                                    onChange={() => props.handleSelectedNewProduct?.(row, false)}
                                />
                                {index + 1}
                            </Stack>
                            </TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row._id}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.name}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.quantity}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.unit_price}</TableCell>
                            <TableCell sx={{ borderRight: 0 }}>{row.total_amount}</TableCell>
                        </TableRow>
                        ))}
                        {filteredProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
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
                    onClick={() => props.handleProductListConfirm()}
                >
                    CONFIRM
                </Button>
                <Button 
                    variant='outlined'
                    sx={{
                        padding: "8px 70px"
                    }}
                    onClick={() => {
                        props.setSelectedProductBill([]);
                        props.onClose();
                    }}
                >
                    CANCLE
                </Button>
            </Stack>
        </Stack>              
    </Dialog>
  )
}

export default DialogProductList