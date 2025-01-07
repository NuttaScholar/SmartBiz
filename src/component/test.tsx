import * as React from "react";
import AppBar_c, { pageApp_e } from "./Organisms/AppBar_c";
import YearSelector from "./Organisms/YearSelector";
import DailyTotalList from "./Molecules/DailyTotalList";
import { DailyMoneyList } from "../dataSet/DataMoney";


//************************************************
// Style
//************************************************
/*
const field: SxProps<Theme> = {
  display: "flex",
  bgcolor: "secondary.main",
  width: "100%",
};*/
//************************************************
// Type
//************************************************

//************************************************
// Variable
//************************************************

//************************************************
// Function
//************************************************
function ResponsiveAppBar() {
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const handleOnChange = (year: number) => {
    setYear(year);
  };
  const [page, setPage] = React.useState<pageApp_e>(pageApp_e.access)

  return (
    <>
      <AppBar_c role="admin" page={page} onClick={(page)=>setPage(page)}/>
      <YearSelector year={year} onChange={handleOnChange}/>
      <DailyTotalList value={DailyMoneyList[0]} onClick={(id)=>{alert(`id: ${id}`)}}/>
    </>
  );
}
export default ResponsiveAppBar;
