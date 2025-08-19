import React from "react";
import TabBox from "../../component/Atoms/TabBox";
import AppBar_c from "../../component/Organisms/AppBar_c";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState(0);
  return (
    <>
      <AppBar_c>
      <TabBox list={["รายการสินค้า", "รายการหมวดหมู่"]} onChange={setState} value={state}>
        <div style={{height: "100px"}}>รายการสินค้า</div>
      </TabBox>
      </AppBar_c>
    </>
  );
};

export default Page_Stock;
