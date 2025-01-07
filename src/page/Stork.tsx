import { useNavigate } from "react-router-dom";
import { gotoPage } from "../function/Rounting";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Stock: React.FC = () => {
  const navigate = useNavigate();
  const handleOnClick = (page: pageApp_e) => {
    gotoPage(page, navigate);
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.stock} onClick={handleOnClick} />
      <h1>Welcome to the Stock Page</h1>
    </>
  );
};

export default Page_Stock;
