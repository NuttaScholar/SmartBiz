import { Avatar, Box, Button, Dialog, FormControlLabel, Slide, Stack, Switch, TextField } from '@mui/material'
import React, { useState } from 'react'
import HeaderDialog from '../component/Molecules/HeaderDialog';
import FieldText from '../component/Molecules/FieldText';
import { AddBox, Code } from '@mui/icons-material';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import PaidIcon from '@mui/icons-material/Paid';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { TransitionProps } from '@mui/material/transitions';
import axios from 'axios';

export type productForm_t = {
    name: string,
    code: string,
    price: number,
    stock: number,
    unit: string,
    status: boolean,
    isMine: boolean,
    img: string,
};

interface myProps {
  open: boolean;
  onClose?: () => void;
  onSubmitProduct?: (data: productForm_t) => void;
}

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

const DialogAddProduct: React.FC<myProps> = (props) => {
    const [formData, setFormData] = useState<productForm_t>({
        name: "",
        code: "",
        price: 0,
        stock: 0,
        unit: "",
        status: false,
        isMine: false,
        img: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                    img: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        try {
            const response = await axios.post("http://localhost:3001/product/addProduct", formData, {
                headers: { "Content-Type": "application/json" }
            });
    
            if (response.status === 200) {
                alert(response.data.message);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

  return (
    <Dialog
        fullScreen
        open= {props.open}
        onClose={props.onClose}
        TransitionComponent={Transition}
    >
        <HeaderDialog label="เพิ่มรายการ" onClick={props.onClose} />
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
            <FieldText
                icon={<Code />}
                required
                label="Part No."
                name="code"
                onChange={handleChange}
            />

            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="upload-image" />
            <label htmlFor="upload-image" style={{ position: "relative", cursor: "pointer" }}>
                <Avatar
                    src={imagePreview || ""}
                    sx={{
                        width: 300,
                        height: 180,
                        borderRadius: "8px",
                        border: "1px solid #000",
                        bgcolor: "#E8E8E8",
                        position: "relative",
                    }}
                >
                    <AddBox
                        sx={{
                            width: 50,
                            height: 50,
                            color: '#0000008A'
                        }}
                    />
                </Avatar>
            </label>

            <FieldText
                icon={<SubtitlesIcon />}
                required
                label="Name"
                name="name"
                onChange={handleChange}
            />

            <FieldText
                icon={<PaidIcon />}
                required
                label="Price"
                name="price"
                type='number'
                onChange={handleChange}
            />

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
                <WidgetsIcon/>
                <TextField
                    required
                    label="Amount"
                    name="stock"
                    type="number"
                    onChange={handleChange}
                    fullWidth
                    sx={{
                        background: "#fff",
                    }}
                />

                <TextField
                    required
                    label="Unit"
                    name="unit"
                    onChange={handleChange}
                    fullWidth
                    sx={{
                        background: "#fff"
                    }}
                />
            </Stack>

            <Stack
                direction="row"
            >
                <FormControlLabel 
                    control={
                        <Switch checked={formData.isMine === true} onChange={handleSwitchChange("isMine")} />
                    } 
                    label="My-Own" 
                />

                <FormControlLabel 
                    control={
                        <Switch checked={formData.status === true} onChange={handleSwitchChange("status")}/>
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
                    save
                </Button>
                <Button
                    variant="outlined"
                    sx={{ width: "150px" }}
                    onClick={props.onClose}
                >
                    cancle
                </Button>
            </Box>

        </Box>

    </Dialog>
  )
}

export default DialogAddProduct