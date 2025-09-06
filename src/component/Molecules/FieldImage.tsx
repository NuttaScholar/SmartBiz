import * as React from "react";
import { Box, Button, Card, CardActionArea, CardActions, CardMedia, Fab } from "@mui/material";
import errImg from "../../assets/NoImage.jpg";
import AddIcon from "@mui/icons-material/Add";
//*********************************************
// Interface
//*********************************************
interface myProps {
  defauleValue?: string;
  onChange?: (file: File) => void;
  previewSize?: number;
  buttonSize?: number;
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

  // Local Function ***************************
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      props.onChange?.(file);
      setImage(URL.createObjectURL(file));
    }
  };
  // XML **************************************
  return (
    <Card sx={{ flexDirection: "column-reverse", display: "flex" }}>
      {image&&<CardActions sx={{justifyContent:"end"}}>
        <Button variant="text" onClick={()=>{
          setImage("")
          if(inputRef.current)inputRef.current.value=""}}>Clear</Button>
      </CardActions>}
      <CardActionArea
        sx={{
          flexDirection: "column",
          justifyContent: "flex-start",
          display: "flex",
          height: "100%",
        }}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {image ? (
            <CardMedia
              component="img"
              sx={{ height: props.previewSize || 300 }}
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
  );
};

export default FieldImage;
