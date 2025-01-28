import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import { useNavigate } from "react-router-dom";
import { gotoPage } from "../function/Rounting";
import FullScreenDialog from "../component/test";

const Page_Access: React.FC = () => {
  const navigate = useNavigate();
  const handleOnClick = (page: pageApp_e) => {
    gotoPage(page, navigate);
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} onClick={handleOnClick} />
      
      <FullScreenDialog/>
    </>
  );
};

export default Page_Access;
