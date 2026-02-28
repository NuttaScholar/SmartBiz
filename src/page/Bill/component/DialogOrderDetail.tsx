import {
  Box,
  Dialog,
  Divider,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import CardProduct, {
  productType_e,
} from "../../../component/Organisms/CardProduct";
import { useBillContext } from "../hooks/useBillContex";
import { billDialog_e } from "../context/BillContext";
import CardOrder from "../../../component/Organisms/CardOrder";
import { orderInfo_t } from "../../../API/BillService/type";
import { stockStatus_e } from "../../../enum";
import Field from "../../../component/Atoms/Field";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
//*********************************************
// Const
//*********************************************
const MenuList: menuList_t[] = [
  { text: "Print", icon: <PrintIcon /> },
  { text: "Edit", icon: <EditIcon /> },
  { text: "Delete", icon: <DeleteIcon /> },
  { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
];
//*********************************************
// Interface
//*********************************************
interface myProps {
  value?: orderInfo_t;
}
//*********************************************
// Component
//*********************************************
const DialogOrderDetail: React.FC<myProps> = (props) => {
  const { state, setState } = useBillContext();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const onClose = () => {
    setState({ ...state, dialogOpen: billDialog_e.none });
  };
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        break;
      case 3:
        containerRef?.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        break;
    }
  };
  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === billDialog_e.detail}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog label={"รายละเอียด"} onClick={onClose}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <IconButton color="inherit">
            <SendIcon />
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          mt: "64px",
          gap: "8px",
        }}
      >
        {props.value && (
          <CardOrder maxWidth="400px" value={{ ...props.value, list: [] }} />
        )}
        <Field maxWidth="1280px" direction="column" alignItem="center">
          <Typography variant="h6">รายการสินค้า</Typography>
        </Field>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "1280px",
            height: "calc(100vh - 127px)",
            overflowY: "auto",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              gap: 1,
            }}
          >
            <CardProduct
              type={productType_e.merchandise}
              maxWidth="400px"
              value={{
                id: "123456",
                img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
                name: "ถ้วยนก",
                status: stockStatus_e.normal,
                type: productType_e.merchandise,
              }}
            />
            <CardProduct
              type={productType_e.merchandise}
              maxWidth="400px"
              value={{
                id: "123456",
                img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
                name: "ถ้วยนก",
                status: stockStatus_e.normal,
                type: productType_e.merchandise,
              }}
            />
            <CardProduct
              type={productType_e.merchandise}
              maxWidth="400px"
              value={{
                id: "123456",
                img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
                name: "ถ้วยนก",
                status: stockStatus_e.normal,
                type: productType_e.merchandise,
              }}
            />
            <CardProduct
              type={productType_e.merchandise}
              maxWidth="400px"
              value={{
                id: "123456",
                img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
                name: "ถ้วยนก",
                status: stockStatus_e.normal,
                type: productType_e.merchandise,
              }}
            />
            <CardProduct
              type={productType_e.merchandise}
              maxWidth="400px"
              value={{
                id: "123456",
                img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
                name: "ถ้วยนก",
                status: stockStatus_e.normal,
                type: productType_e.merchandise,
              }}
            />
          </Box>
        </Box>
      </Box>
      <MySpeedDial
        menuList={MenuList}
        icon={<MoreVertIcon />}
        onClick={speedDialHandler}
      />
    </Dialog>
  );
};
export default DialogOrderDetail;
