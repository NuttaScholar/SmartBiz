import { NavigateFunction } from "react-router-dom";
import { pageApp_e } from "../component/Organisms/AppBar_c";

export const gotoPage = (page: pageApp_e, navigate:NavigateFunction) => {
  switch (page) {
    case pageApp_e.access:
      navigate("/access");
      break;
    case pageApp_e.bill:
      navigate("/bill");
      break;
    case pageApp_e.logger:
      navigate("/checkIn");
      break;
    case pageApp_e.logout:
      navigate("/login");
      break;
    case pageApp_e.lone:
      navigate("/cadit");
      break;
    case pageApp_e.setPass:
      navigate("/setPass");
      break;
    case pageApp_e.stock:
      navigate("/stock");
      break;
  }
};
