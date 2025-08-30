import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
} from "@mui/material";
import errImg from "../../assets/NoImage.jpg";
import AddIcon from "@mui/icons-material/Add";
//*********************************************
// Interface
//*********************************************
interface myProps {
  defauleValue?: string;
  name?: string;
  icon?: React.ReactNode;
}
//*********************************************
// Component
//*********************************************
const FieldImage: React.FC<myProps> = () => {
  const [image, setImage] = React.useState<string>("");
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
        {image ? (
          <CardMedia
            component="img"
            sx={{ width: 120 }}
            image={image}
            onError={() => {
              setImage(errImg);
            }}
          />
        ) : (
          <Box
            sx={{
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.selectedHover",
            }}
          >
            <AddIcon sx={{ fontSize: 40 }} />
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};

export default FieldImage;
