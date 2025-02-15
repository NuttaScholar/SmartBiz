import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import FullScreenDialog from "../component/test";

const Page_Access: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} />
      
      <FullScreenDialog/>
    </>
  );
};

export default Page_Access;
