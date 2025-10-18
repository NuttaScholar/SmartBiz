import React, { useState } from "react";
import { Box, Button, Dialog, IconButton, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FieldText from "../../../component/Molecules/FieldText";
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldSelector, {
  listSelect_t,
} from "../../../component/Molecules/FieldSelector";
import { useAuth } from "../../../hooks/useAuth";
import stockWithRetry_f from "../lib/stockWithRetry";
import { errorCode_e, productType_e } from "../../../enum";
import { formProduct_t, productInfo_t } from "../../../API/StockService/type";
import { ErrorString } from "../../../function/Enum";
import DeleteIcon from "@mui/icons-material/Delete";

//*********************************************
// Type
//*********************************************

//*********************************************
// Constante
//*********************************************
const typeList: listSelect_t[] = [
  { label: "สินค้า", value: productType_e.merchandise },
  { label: "วัสถุดิบ", value: productType_e.material },
  { label: "สินค้าขายพ่วง", value: productType_e.another },
];
//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  onClose: (val?: productInfo_t[]) => void;
}
//*********************************************
// Component
//*********************************************
const DialogFormProduct: React.FC<myProps> = (props) => {
  // Hook *********************
  const authContext = useAuth();
  const { state, setState } = useStockContext();
  const [type, setType] = useState<number | null>(productType_e.merchandise);
  const [file, setFile] = useState<File | null>();
  // Local Function ***********
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const data = formJson as formProduct_t;

    try {
      if (state.productForm) {
        // Edit
        console.log("Edit Product", file);
        const newData: formProduct_t = { ...data, img: file };
        const result = await stockWithRetry_f.putProduct(authContext, newData);
        if (result.status === "success") {
          setState({
            ...state,
            dialogOpen: stockDialog_e.none,
            productForm: undefined,
            reface: state.reface + 1,
          });
          setFile(undefined);
        } else {
          alert(
            `เกิดข้อผิดพลาด ${ErrorString(result.errCode || errorCode_e.UnknownError)}`
          );
        }
      } else {
        // Add
        const newData: formProduct_t = { ...data, img: file };
        const result = await stockWithRetry_f.postProduct(authContext, newData);
        if (result.status === "success") {
          setState({
            ...state,
            dialogOpen: stockDialog_e.none,
            productForm: undefined,
            reface: state.reface + 1,
          });
          setFile(undefined);
        } else {
          alert(
            `เกิดข้อผิดพลาด ${ErrorString(result.errCode || errorCode_e.UnknownError)}`
          );
        }
      }

    } catch (err) {
      alert(`เกิดข้อผิดพลาด`);
      console.log("postProductError", err);
    }
  };
  const onClose = () => {
    props.onClose();
  };
  const onDel = async () => {
    try {
      if (state.productForm) {
        const resProduct = await stockWithRetry_f.delProduct(
          authContext,
          state.productForm.id
        );
        if (resProduct.status === "success") {
          console.log("ลบรายการสำเร็จ");
          setState({
            ...state,
            dialogOpen: stockDialog_e.none,
            productForm: undefined,
            reface: state.reface + 1,
          });
        } else {
          alert(
            `เกิดข้อผิดพลาด ${ErrorString(resProduct.errCode || errorCode_e.UnknownError)}`
          );
          console.log("StockError");
        }
      }
    } catch (err) {
      alert(`เกิดข้อผิดพลาด`);
      console.log("postProductError", err);
    }
  };
  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === stockDialog_e.productForm}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={state.productForm ? "แก้ไขรายการ" : "เพิ่มรายการ"}
        onClick={onClose}
      >
        {state.productForm && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexGrow: 1,
            }}
          >
            <IconButton color="inherit" onClick={onDel}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </HeaderDialog>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FieldImage
          label="Product Image"
          defauleValue={state.productForm?.img}
          buttonSize={100}
          onChange={(file)=>{file?setFile(file):setFile(null)}}
        />
        <FieldText
          required
          label="Product ID"
          name="id"
          placeholder="รหัสสินค้า"
          defauleValue={state.productForm?.id}
          readonly={state.productForm !== undefined}
        />
        <FieldText
          required
          label="Name"
          name="name"
          placeholder="ชื่อสินค้า"
          defauleValue={state.productForm?.name}
        />
        <FieldSelector
          name="type"
          label="Type"
          required
          list={typeList}
          defauleValue={state.productForm?.type.toString()}
          onChange={setType}
        />
        <FieldText
          name="description"
          label="Description"
          placeholder="คำอธิบาย"
          defauleValue={state.productForm?.description}
        />
        {(type === productType_e.merchandise ||
          type === productType_e.another) && (
          <FieldText
            required
            type="number"
            label="Price"
            name="price"
            placeholder="ราคา"
            defauleValue={state.productForm?.price?.toString()}
          />
        )}
        {(type === productType_e.material ||
          type === productType_e.merchandise) && (
          <>
            <FieldText
              required
              type="number"
              label="Amount"
              name="amount"
              placeholder="จำนวน"
              readonly={state.productForm !== undefined}
              defauleValue={
                state.productForm && state.productForm.amount?.toString()
              }
            />
            <FieldText
              required
              type="number"
              label="Condition"
              name="condition"
              placeholder="เตือนเมื่อสินค้าเหลือน้อยกว่าที่ระบุ"
              defauleValue={state.productForm?.condition?.toString()}
            />
          </>
        )}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            my: "32px",
          }}
        >
          <Button variant="contained" type="submit" sx={{ width: "150px" }}>
            save
          </Button>
          <Button variant="outlined" sx={{ width: "150px" }} onClick={onClose}>
            cancle
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
export default DialogFormProduct;
