import { useNavigate } from "react-router-dom";
import { gotoPage } from "../function/Rounting";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Cadit: React.FC = () => {
  const navigate = useNavigate();
  const handleOnClick = (page: pageApp_e) => {
    gotoPage(page, navigate);
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.lone} onClick={handleOnClick} />
      <h1>Welcome to the Cadit Page</h1>
    </>
  );
};

export default Page_Cadit;
