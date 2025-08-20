import React from "react";
import TabBox from "../../component/Atoms/TabBox";
import AppBar_c from "../../component/Organisms/AppBar_c";
import FieldSearch from "../../component/Molecules/FieldSearch";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState(0);
  return (
    <>
      <AppBar_c>
        <TabBox
          list={[
            "สินค้า",
            "วัตถุดิบ",
            "สินค้าขายพ่วง",
          ]}
          height="100vh"
          alignItems="center"
          onChange={setState}
          value={state}
        >
          <FieldSearch />
          <div style={{ height: "1000px" }}>รายการสินค้า</div>
        </TabBox>
      </AppBar_c>
    </>
  );
};

export default Page_Stock;
