import React from 'react'
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { Button, Checkbox, Dialog, Paper, Slide, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { IndeterminateCheckBox } from '@mui/icons-material';
import FieldContact from '../component/Molecules/FieldContact';
import { contactInfo_t } from '../component/Molecules/ContactInfo';
import { newProductBill } from '../page/Bill';

export const tableHeadCellStyle = {
  position: "sticky",
  top: 0,
  padding: "6px 16px",
  background: "#0078D4",
  color: "#fff",
  zIndex: 1,
}

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
  ContactData: contactInfo_t[];
  products: newProductBill[];
  selectedProduct: string[];
  openProductListDialog: boolean;
  onClose?: () => void;
  setProductBillList: (products: newProductBill[]) => void;
  handleSelectedProduct?: (id: string, all: boolean) => void;
  setOpenAddContact: (enable: boolean) => void;
  handleSelectedBillName: (value: string) => void;
  setOpenProductListDialog: (enable: boolean) => void;
  handleDeleteProductBill: (productId: string[]) => void;
}

const DialogAddBill: React.FC<myProps> = (props) => {

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
        <HeaderDialog label="ออกบิล" onClick={props.onClose}/>
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
                sx={{
                    width: { xs: "100%", sm: "480px" ,md: "480px" },
                    background: "#E0EFFF",
                    padding: "0px 16px",
                    borderRadius: "8px"
                }}
            >
                <AssignmentIndIcon/>
                <FieldContact 
                    list={props.ContactData}
                    onAdd={()=>props.setOpenAddContact(true)}
                    placeholder="Contact"
                    name="who"
                    onChange={(value) => props.handleSelectedBillName(value)} 
                />
            </Stack>

            <Stack
              gap={1}
              sx={{
                width: { xs: "100%", sm: "100%", md: "800px" },
                background: "#E0EFFF",
                padding: "8px 10px",
                borderRadius: "8px",
              }}
            >
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Button 
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => props.setOpenProductListDialog(!props.openProductListDialog)}
                  sx={{
                    color: props.openProductListDialog ? "#0078D4" : "#00000061",
                    backgroundColor: "#fff" ,
                  }}
                >
                  Add
                </Button>

                <Button 
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  sx={{
                    color: props.selectedProduct.length > 0 ? "#0078D4" : "#00000061",
                    backgroundColor: "#fff" ,
                  }}
                  onClick={() => props.handleDeleteProductBill(props.selectedProduct)}
                >
                  Delete
                </Button>
              </Stack>
              <TableContainer
                component={Paper}
                sx={{
                  height: "626px",
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
                              props.selectedProduct.length === props.products?.length
                            }
                            indeterminate={
                              props.selectedProduct.length > 0 &&
                              props.selectedProduct.length < (props.products?.length || 0)
                            }
                            indeterminateIcon={<IndeterminateCheckBox sx={{ color: "#fff" }} />}
                            onChange={() => props.handleSelectedProduct?.("", true)}
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
                    {props.products?.map((row, index) => (
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
                              checked={props.selectedProduct.includes(row.product._id)}
                              onChange={() => props.handleSelectedProduct?.(row.product._id, false)}
                            />
                            {index + 1}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ borderRight: 0 }}>{row.product._id}</TableCell>
                        <TableCell sx={{ borderRight: 0 }}>{row.product.name}</TableCell>
                        <TableCell sx={{ borderRight: 0 }}>{row.quantity}</TableCell>
                        <TableCell sx={{ borderRight: 0 }}>{row.product.unit_price}</TableCell>
                        <TableCell sx={{ borderRight: 0 }}>{row.quantity * row.product.unit_price}</TableCell>
                      </TableRow>
                    ))}
                    {props.products?.length === 0 && (
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
            </Stack>

            <Stack
              justifyContent="center"
              alignItems="center"
              gap="16px"
              sx={{
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
              >
                CONFIRM
              </Button>
              <Button 
                variant='outlined'
                sx={{
                  padding: "8px 70px"
                }}
                onClick={() => {
                  props.setProductBillList([]);
                  props.onClose?.();
                }}
              >
                CANCLE
              </Button>
            </Stack>
        </Stack>
        
    </Dialog>
  )
}

export default DialogAddBill