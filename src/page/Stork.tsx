import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";

const Page_Stock: React.FC = () => {

  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.stock} />
      <h1>Welcome to the Stock Page</h1>
    </>
  );
};

export default Page_Stock;
