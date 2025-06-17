import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_NotFound: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" />
      <h1>Error 404: Page Not Found</h1>
    </>
  );
};

export default Page_NotFound;
