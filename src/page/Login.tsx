import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Login: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.logout}/>
      <h1>Welcome to the Login Page</h1>
    </>
  );
};

export default Page_Login;
