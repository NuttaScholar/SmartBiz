import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Cadit: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.lone} />
      <h1>Welcome to the Cadit Page</h1>
    </>
  );
};

export default Page_Cadit;
