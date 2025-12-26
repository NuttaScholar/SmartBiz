import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Typography,
} from "@mui/material";
import errImg from "../../assets/NoImage.jpg";
import AddIcon from "@mui/icons-material/Add";
import Field from "../Atoms/Field";
import DialogShowImg from "../Organisms/DialogShowImg";
//*********************************************
// Interface
//*********************************************
interface myProps {
  label?: string;
  hideField?: boolean;
  defauleValue?: string;
  onChange?: (file: File | null) => void;
  previewSize?: number;
  buttonSize?: number;
  readonly?: boolean;
}
//*********************************************
// Function
//*********************************************

//*********************************************
// Component
//*********************************************
const FieldImage: React.FC<myProps> = (props) => {
  // Hook *************************************
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [image, setImage] = React.useState<string>(props.defauleValue ?? "");
  const [open, setOpen] = React.useState<boolean>(false);
  // Local Function ***************************
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      props.onChange?.(file);
      setImage(URL.createObjectURL(file));
    }
  };
  // XML **************************************
  return (
    <>
      <Field hide={props.hideField} direction="column" alignItem="flex-start">
        {props.label && (
          <Typography variant="body1" sx={{ mr: 1 }} color="textSecondary">
            {props.label}:
          </Typography>
        )}

        <Card
          sx={{
            flexDirection: "column-reverse",
            display: "flex",
            width: "100%",
          }}
        >
          {image && !props.readonly && (
            <CardActions sx={{ justifyContent: "end" }}>
              <Button
                variant="text"
                onClick={() => {
                  setOpen(true);
                }}
              >
                View
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setImage("");
                  props.onChange?.(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Clear
              </Button>
            </CardActions>
          )}
          <CardActionArea
            sx={{
              flexDirection: "column",
              justifyContent: "flex-start",
              display: "flex",
              height: "100%",
            }}
            onClick={() => {
              props.readonly ? setOpen(true) : inputRef.current?.click();
            }}
          >
            {image ? (
              <CardMedia
                component="img"
                sx={{ width: props.previewSize || 300, my: 1 }}
                image={image}
                onError={() => {
                  setImage(errImg);
                }}
              />
            ) : (
              <Box
                sx={{
                  width: props.buttonSize || 300,
                  height: props.buttonSize || 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.selectedHover",
                  flexDirection: "column",
                }}
              >
                <AddIcon sx={{ fontSize: 40 }} />
              </Box>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </CardActionArea>
        </Card>
      </Field>
      <DialogShowImg open={open} img={image} onClose={() => setOpen(false)} />
    </>
  );
};

export default FieldImage;
