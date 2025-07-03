import { useNavigate } from "react-router-dom";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import DialogSetUser from "../component/Organisms/DialogSetUser";

const Page_SetUser: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <DialogSetUser open={true} onClose={()=>navigate(-1)}/>
    </>
  );
};

export default Page_SetUser;
