import React from "react";
import TabBox from "../../component/Atoms/TabBox";
import AppBar_c from "../../component/Organisms/AppBar_c";
import FieldSearch from "../../component/Molecules/FieldSearch";
import CardValue from "../../component/Atoms/CardValue";
import { Box } from "@mui/material";
import CardProduct from "../../component/Organisms/CardProduct";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState(0);
  return (
    <>
      <AppBar_c>
        <Box
          sx={{
            my: "8px",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CardValue
            label="สินค้าหมด"
            selected
            value={2}
            color_value="error"
            maxWidth="200px"
          />
          <CardValue
            label="สินค้าใกล้หมด"
            value={2}
            color_value="info"
            maxWidth="200px"
          />
          <CardValue
            label="วัตถุดิบหมด"
            value={2}
            color_value="error"
            maxWidth="200px"
          />
        </Box>
        <FieldSearch />
        <TabBox
          list={["สินค้า", "วัตถุดิบ", "สินค้าขายพ่วง"]}
          height="calc(100vh - 160px)"
          alignItems="center"
          onChange={setState}
          value={state}
          maxWidth="1280px"
        >
          <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2, p: 2 }}>
            <CardProduct
              value={{
                id: "1",
                name: "Sample Product",
                price: 0,
                img: "",
                stock: 0,
                description: "ถ้วยน้ำพลาสติกใส",
              }}
              maxWidth="400px"
            />
            <CardProduct
              value={{
                id: "1",
                name: "Sample Product",
                price: 0,
                img: "",
                stock: 0,
                description: "ถ้วยน้ำพลาสติกใส",
              }}
              maxWidth="400px"
              disabled
            />
            <CardProduct
              value={{
                id: "1",
                name: "Sample Product",
                price: 0,
                img: "",
                stock: 0,
                description: "ถ้วยน้ำพลาสติกใส",
              }} maxWidth="400px"
            />
          </Box>
        </TabBox>
      </AppBar_c>
    </>
  );
};

export default Page_Stock;
