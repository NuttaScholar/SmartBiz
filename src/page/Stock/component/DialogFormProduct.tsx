import React, { useState } from "react";
import { Box, Button, Dialog, Slide } from "@mui/material";
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
import { productInfo_t } from "../../../API/StockService/type";
import { ErrorString } from "../../../function/Enum";
import storegeWithRetry_f from "../../../lib/storageWithRetry";

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
  const [file, setFile] = useState<File | null>(null);
  // Local Function ***********
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const data = formJson as productInfo_t;

    try {
      if (state.productForm) {
        // Edit
        console.log("Edit Product", data);
      } else {
        // Add
        console.log("Add Product", data);
        const newData:productInfo_t = {...data, img: `product/${data.id}`}
        if (file) {
          const result = await stockWithRetry_f.postProduct(authContext, newData);
          if(result.status==="success"){
            const formData = new FormData();
            formData.append("file", file);  
            formData.append("Bucket", "product");  
            formData.append("Key", data.id);  
            const resImg = await storegeWithRetry_f.postImg(authContext, formData);
            if(resImg.status==="success"){
              setState({...state, dialogOpen: stockDialog_e.none, productForm: undefined})
            }else{
              alert(`เกิดข้อผิดพลาด ${ErrorString(resImg.errCode||errorCode_e.UnknownError)}`);
              console.log("postProductError", ErrorString(resImg.errCode||errorCode_e.UnknownError));
            }
          }else{
            alert(`เกิดข้อผิดพลาด ${ErrorString(result.errCode||errorCode_e.UnknownError)}`);
            console.log("postProductError", ErrorString(result.errCode||errorCode_e.UnknownError));
          }
        } else {
          alert("โปรดอัพโหลดรูปสินค้า");
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

  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === stockDialog_e.createForm}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={state.productForm ? "แก้ไขรายการ" : "เพิ่มรายการ"}
        onClick={onClose}
      />
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
          onChange={setFile}
        />
        <FieldText
          required
          label="Product ID"
          name="id"
          defauleValue={state.productForm?.id}
        />
        <FieldText
          required
          label="Name"
          name="name"
          defauleValue={state.productForm?.name}
        />
        <FieldSelector
          name="type"
          label="Type"
          required
          list={typeList}
          onChange={setType}
        />
        <FieldText
          name="description"
          label="Description"
          defauleValue={state.productForm?.description}
        />
        {(type === productType_e.merchandise ||
          type === productType_e.another) && (
          <FieldText
            required
            type="number"
            label="Price"
            name="price"
            defauleValue={state.productForm?.price?.toString()}
          />
        )}
        {(type === productType_e.material ||
          type === productType_e.merchandise) && (
          <>
            <FieldText
              required
              type="number"
              label="Stock"
              name="stock"
              defauleValue={state.productForm?.amount?.toString()}
            />
            <FieldText
              required
              type="number"
              label="Condition"
              name="condition"
              placeholder="เตือนเมื่อสินค้าเหลือน้อยกว่าที่ระบุ"
              defauleValue={state.productForm?.amount?.toString()}
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
