import * as React from "react";
import Field from "../Atoms/Field";
import TextField from "@mui/material/TextField";
import { Card, CardActionArea, CardContent, CardMedia } from "@mui/material";
import errImg from "../../assets/NoImage.jpg";
//*********************************************
// Interface
//*********************************************
interface myProps {
  label?: string;
  placeholder?: string;
  defauleValue?: string;

  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  icon?: React.ReactNode;
}
//*********************************************
// Component
//*********************************************
const FieldImage: React.FC<myProps> = (props) => {
  const [image, setImage] = React.useState<string>(props.value || errImg);
  return (
    <Card>
      <CardActionArea
        
        sx={{
          flexDirection: "column",
          justifyContent: "flex-start",
          display: "flex",
          height: "100%",
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 120 }}
          image={image}
          onError={() => {
            setImage(errImg);
          }}
        />
      </CardActionArea>
      <CardContent>
        
      </CardContent>
    </Card>
  );
};

export default FieldImage;
