import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import { useNavigate } from "react-router-dom";
import { gotoPage } from "../function/Rounting";

const Page_Access: React.FC = () => {
  const navigate = useNavigate();
  const handleOnClick = (page: pageApp_e) => {
    gotoPage(page, navigate);
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} onClick={handleOnClick} />
      <h1>Welcome to the Access Page</h1>
    </>
  );
};

export default Page_Access;
