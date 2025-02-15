import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_CheckIn: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.logger} />
      <h1>Welcome to the CheckIn Page</h1>
    </>
  );
};

export default Page_CheckIn;
