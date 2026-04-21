import { Box, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import Label_parameter from "../../../component/Atoms/Label_parameter";

//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
export default function Page_BillPreview() {
  // Hook ************************************

  // Local function **************************

  // Use Effect ******************************
  useEffect(() => {
    document.body.classList.add("body_preview");
  }, []);
  // Render **********************************
  return (
    <Box
      sx={{ width: "100%", display: "flex", justifyContent: "center", p: 2 }}
    >
      <Box sx={{ width: "720px", p: 2, backgroundColor: "white" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          ใบเสร็จรับเงิน
        </Typography>
        <Grid container spacing={1}>
          <Grid size={8}>
            <Label_parameter label="ลูกค้า:" value={"Nutta"} gap="8px" />
          </Grid>
          <Grid size={4}>
            <Label_parameter label="เลขที่:" value={"123456"} gap="8px" />
          </Grid>
          <Grid size={8}>
            <Label_parameter
              label="ที่อยู่:"
              value={"123 Bangkok 1234"}
              gap="8px"
            />
          </Grid>
          <Grid size={4}>
            <Label_parameter label="วันที่:" value={"18/4/2569"} gap="8px" />
          </Grid>
          <Grid size={12}>
            <Label_parameter label="เลขผู้เสียภาษี:" value={"123456789"} gap="8px" />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
