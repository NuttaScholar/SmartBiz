import React from 'react'
import { TransitionProps } from '@mui/material/transitions';
import { 
  Box,
  Dialog, 
  IconButton, 
  Paper, 
  Slide, 
  SpeedDial, 
  SpeedDialAction, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
} from '@mui/material';
import HeaderDialog from '../component/Molecules/HeaderDialog';
import { Bill_t } from '../dataSet/DataBill';
import Bill_Detail from '../component/Molecules/Bill_Detail';
import Checkbox  from '@mui/material/Checkbox';
import { IndeterminateCheckBox, MoreVert } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';

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
    handleSelectedProduct?: (id: string, all: boolean) => void;
    handleSelectedBillOption?: (value: string, billNo: number) => void;
    selectedProduct: string[];
    bill: Bill_t;
}

const tableHeadCellStyle = {
  position: "sticky",
  top: 0,
  padding: "6px 16px",
  background: "#0078D4",
  color: "#fff",
  zIndex: 1,
}

const dialActions = [
  { icon: <DeleteIcon />, name: 'Delete', action: "Delete Product" },
  { icon: <PrintIcon />, name: 'Print', action: "Print" },
  { icon: <CheckIcon />, name: 'Next Step', action: "Next Step" },
];

const DialogBill: React.FC<myProps> = (props) => {
    if (!props.bill) return null;
  return (
    <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        TransitionComponent={Transition}
    >
        <HeaderDialog label="รายละเอียด" onClick={props.onClose}>
          {props.handleSelectedBillOption && props.bill && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", flexGrow: 1 }}
            >
              <IconButton
                color="inherit"
                onClick={() => props.handleSelectedBillOption?.("Delete", props.bill.no)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </HeaderDialog>
        

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
              width: { xs: "100%", sm: "100%", md: "900px" },
              maxHeight: "626px",
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
                          (props.bill.products?.length || 0) > 0 &&
                          props.selectedProduct.length === props.bill?.products?.length
                        }
                        indeterminate={
                          props.selectedProduct.length > 0 &&
                          props.selectedProduct.length < (props.bill?.products?.length || 0)
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
                          checked={props.selectedProduct.includes(row._id)}
                          onChange={() => props.handleSelectedProduct?.(row._id, false)}
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
              </TableBody>
            </Table>

            <SpeedDial
              ariaLabel="SpeedDial"
              icon={<MoreVert />}
              direction="up"
              FabProps={{
                size: "small"
              }}
              sx={{
                position: "absolute",
                bottom: "19px",
                right: "19px",
              }}
            >
              {dialActions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={() => {
                    if (props.bill && props.handleSelectedBillOption) {
                      props.handleSelectedBillOption(action.action, props.bill.no);
                    }
                  }}
                />
              ))}
            </SpeedDial>
            
          </TableContainer>
        </Stack>
    </Dialog>
  )
}

export default DialogBill