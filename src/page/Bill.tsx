import { useNavigate } from "react-router-dom";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import { gotoPage } from "../function/Rounting";

const Page_Bill: React.FC = () => {
  const navigate = useNavigate();
    const handleOnClick = (page: pageApp_e) => {
      gotoPage(page, navigate);
    };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.bill} onClick={handleOnClick} />
      <h1>Welcome to the Bill Page</h1>
    </>
  );
};

export default Page_Bill;
