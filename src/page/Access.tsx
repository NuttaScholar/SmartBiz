import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import { useNavigate } from "react-router-dom";
import { gotoPage } from "../function/Rounting";
import { DailyMoneyList } from "../dataSet/DataMoney";
import MonthlyTotalList from "../component/Organisms/MonthlyTotalList";

const Page_Access: React.FC = () => {
  const navigate = useNavigate();
  const handleOnClick = (page: pageApp_e) => {
    gotoPage(page, navigate);
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} onClick={handleOnClick} />
      <MonthlyTotalList value={DailyMoneyList}/>
      
    </>
  );
};

export default Page_Access;
