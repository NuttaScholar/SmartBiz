import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Bill: React.FC = () => {
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.bill} />
      <h1>Welcome to the Bill Page</h1>
    </>
  );
};

export default Page_Bill;
