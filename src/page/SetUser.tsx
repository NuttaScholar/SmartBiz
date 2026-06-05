import { useNavigate } from "react-router-dom";
import React from "react";
import {
  EditUserFrom_t,
  RegistFrom_t,
  UserProfile_t,
} from "../API/LoginService/type";
import User_f from "../API/LoginService/User";
import { errorCode_e } from "../enum";
import Login_f from "../API/LoginService/Login";
import DialogFormUser from "../component/Molecules/DialogFormUser";
import AlertConfirm from "../component/Molecules/AlertConfirm";
import HeaderDialog_Search from "../component/Molecules/HeaderDialog_Search";
import { Box } from "@mui/material";
import FieldSearch from "../component/Molecules/FieldSearch";
import ListUser from "../component/Molecules/ListUser";
import {
  redirectToLogin,
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../lib/authRedirect";

const Page_SetUser: React.FC = () => {
  // Local Function **************
  // Hook **************
  const navigate = useNavigate();
  const [token, setToken] = React.useState("");
  const [key, setKey] = React.useState("");
  const [list, setList] = React.useState<UserProfile_t[]>([]);
  const [targetID, setTargetID] = React.useState("");
  const [openDel, setOpenDel] = React.useState(false);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editValue, setEditValue] = React.useState<UserProfile_t>();
  // Local Function **************
  const refreshTokenOrRedirect = async () => {
    const resToken = await Login_f.getToken();
    if (resToken.success && resToken.data?.token) {
      setToken(resToken.data.token);
      return true;
    }

    redirectToLogin(navigate);
    return false;
  };

  function onChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setKey(event.target.value);
  }
  const onSearch = async (keyword: string) => {
    try {
      const resUser = await User_f.get(token, keyword);
      if (resUser.success) {
        setList(resUser.data || []);
      } else if (resUser.errCode === errorCode_e.TokenExpiredError) {
        await refreshTokenOrRedirect();
      } else if (redirectToLoginOnAuthError(navigate, resUser.errCode)) {
        return;
      } else {
        alert("รับรายการ User ล้มเหลว");
      }
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.log(err);
    }
  };
  const onAdd = async (val: RegistFrom_t) => {
    try {
      const resUser = await User_f.post(token, val);
      if (resUser.success) {
        const resGet = await User_f.get(token);
        if (resGet.success && resGet.data) {
          setList(resGet.data);
          setOpenAdd(false);
        } else {
          if (redirectToLoginOnAuthError(navigate, resGet.errCode)) return;

          alert("รับรายการ User ล้มเหลว");
        }
      } else if (resUser.errCode === errorCode_e.TokenExpiredError) {
        await refreshTokenOrRedirect();
      } else if (redirectToLoginOnAuthError(navigate, resUser.errCode)) {
        return;
      } else {
        alert("สร้างบัญชี User ล้มเหลว");
      }
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.log(err);
    }
  };
  const onEdit = async (val: EditUserFrom_t) => {
    try {
      const resPut = await User_f.put(token, val);
      if (resPut.success) {
        const resGet = await User_f.get(token);
        if (resGet.success && resGet.data) {
          setList(resGet.data);
          setOpenEdit(false);
        } else {
          if (redirectToLoginOnAuthError(navigate, resGet.errCode)) return;

          alert("รับรายการ User ล้มเหลว");
        }
      } else if (resPut.errCode === errorCode_e.TokenExpiredError) {
        await refreshTokenOrRedirect();
      } else if (redirectToLoginOnAuthError(navigate, resPut.errCode)) {
        return;
      } else {
        alert("แก้ไข User ล้มเหลว");
      }
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.log(err);
    }
  };
  const onDel = async () => {
    try {
      const resDel = await User_f.del(token, targetID);
      if (resDel.success) {
        const resGet = await User_f.get(token);
        if (resGet.success && resGet.data) {
          setList(resGet.data);
          setOpenDel(false);
        } else {
          if (redirectToLoginOnAuthError(navigate, resGet.errCode)) return;

          alert("รับรายการ User ล้มเหลว");
        }
      } else if (resDel.errCode === errorCode_e.TokenExpiredError) {
        await refreshTokenOrRedirect();
      } else if (redirectToLoginOnAuthError(navigate, resDel.errCode)) {
        return;
      } else {
        alert("ลบ User ล้มเหลว");
      }
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.log(err);
    }
  };
  const initPage = React.useCallback(async () => {
    try {
      const resLogin = await Login_f.getToken();
      if (!resLogin.success || !resLogin.data?.token) {
        redirectToLogin(navigate);
      } else {
        const resUser = await User_f.get(resLogin.data?.token);
        setToken(resLogin.data?.token);
        if (resUser.success && resUser.data) {
          setList(resUser.data);
        } else {
          if (redirectToLoginOnAuthError(navigate, resUser.errCode)) return;

          alert("รับรายการ User ล้มเหลว");
        }
      }
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      console.log(err);
    }
  }, [navigate]);
  // Use Effect **************
  React.useEffect(() => {
    initPage();
  }, [initPage]);
  return (
    <>
      <HeaderDialog_Search
        label="Set User"
        onBack={() => navigate(-1)}
        onChange={onChangeHandler}
        onSearch={onSearch}
        onAdd={() => setOpenAdd(true)}
        value={key}
      />
      <Box sx={{ my: "72px" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FieldSearch
            label="Search"
            display={{ xs: "flex", sm: "none" }}
            value={key}
            onChange={onChangeHandler}
            onSubmit={onSearch}
          />
        </Box>
        <ListUser
          list={list}
          onDel={(val) => {
            setTimeout(() => {
              setOpenDel(true);
            }, 500);

            setTargetID(val._id || "");
          }}
          onEdit={(val) => {
            setEditValue(val);
            setOpenEdit(true);
          }}
        />
      </Box>

      <DialogFormUser
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={onAdd}
      />
      <DialogFormUser
        open={openEdit}
        defaultValue={editValue}
        onClose={() => setOpenEdit(false)}
        onEdit={onEdit}
      />

      <AlertConfirm
        open={openDel}
        title="Delete User"
        content="คุณกำลังลบบัญชีผู้ใช้งาน กระบวนการนี้หากดำเนิดการแล้วจะไม่สามารถกู้คืนกลับมาได้ คุณต้องการดำเนินการต่อหรือไม่?"
        onClose={() => setOpenDel(false)}
        onConfirm={onDel}
      />
    </>
  );
};

export default Page_SetUser;
