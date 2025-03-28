import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControlLabel,
  Slide,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import { AddBox, Code } from "@mui/icons-material";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import PaidIcon from "@mui/icons-material/Paid";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { TransitionProps } from "@mui/material/transitions";
import axios from "axios";
import { productForm_t } from "./DialogAddProduct";
import Field from "../component/Atoms/Field";

interface myProps {
  productId: string;
  open: boolean;
  onClose?: () => void;
  onUpdateProduct?: (data: productForm_t) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogEditProduct: React.FC<myProps> = (props) => {
  const [formData, setFormData] = useState<productForm_t>(
    {
      name: "",
      code: "",
      price: 0,
      stock: 0,
      unit: "",
      status: false,
      isMine: false,
      img: "",
    }
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductById = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3001/product/getProduct/${props.productId}`);
      if (response.status === 200) {
        setFormData({
          name: response.data.name,
          code: response.data.code,
          price: response.data.price,
          stock: response.data.stock,
          unit: response.data.unit,
          status: response.data.status,
          isMine: response.data.isMine,
          img: response.data.img
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (props.productId !== "") {
      fetchProductById();
    }
  }, [props.productId]);

  if (isLoading) {
    return (
      <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        TransitionComponent={Transition}
      >
        <HeaderDialog label="แก้ไขสินค้า" onClick={props.onClose} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: "status" | "isMine") => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [name]: event.target.checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกิน 1MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          img: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.put(`http://localhost:3001/product/update/${props.productId}`,
        formData, { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        alert(response.data.message);
        if (props.onUpdateProduct) props.onUpdateProduct(formData);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <HeaderDialog label="แก้ไขสินค้า" onClick={props.onClose} />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: "480px",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          my: "8px",
          gap: "8px",
        }}
      >
        
        <Field alignItem="center">
          <Code />
          <TextField
            label="Part No."
            name="code"
            defaultValue={formData.code}
            onChange={handleChange}
            size="small"
            sx={{
              background: "#fff",
              width: "100%",
            }}
          />
        </Field>
        

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          id="upload-image"
        />
        <label
          htmlFor="upload-image"
          style={{ position: "relative", cursor: "pointer" }}
        >
          <Avatar
            src={formData.img || "" }
            sx={{
              width: 300,
              height: 180,
              borderRadius: "8px",
              border: "1px solid #000",
              bgcolor: "#E8E8E8",
              position: "relative",
            }}
          >
            <AddBox sx={{ width: 50, height: 50, color: "#0000008A" }} />
          </Avatar>
        </label>

        <Field alignItem="center">
          <SubtitlesIcon />
          <TextField
            label="Name"
            name="name"
            defaultValue={formData.name}
            onChange={handleChange}
            size="small"
            sx={{
              background: "#fff",
              width: "100%",
            }}
          />
        </Field>
        

        <Field alignItem="center">
          <PaidIcon />
          <TextField
            label="Price"
            name="price"
            type="number"
            defaultValue={formData.price}
            onChange={handleChange}
            size="small"
            sx={{
              background: "#fff",
              width: "100%",
            }}
          />
        </Field>
        
        

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={{
            background: "#E0EFFF",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          <WidgetsIcon />
          <TextField
            required
            label="Amount"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            fullWidth
            sx={{ background: "#fff" }}
          />
          <TextField
            required
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            fullWidth
            sx={{ background: "#fff" }}
          />
        </Stack>

        <Stack direction="row">
          <FormControlLabel
            control={
              <Switch
                checked={formData.isMine}
                onChange={handleSwitchChange("isMine")}
              />
            }
            label="My-Own"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={handleSwitchChange("status")}
              />
            }
            label="Enable"
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            gap: "16px",
            my: "32px",
          }}
        >
          <Button variant="contained" type="submit" sx={{ width: "150px" }}>
            Save
          </Button>
          <Button variant="outlined" sx={{ width: "150px" }} onClick={props.onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DialogEditProduct;
