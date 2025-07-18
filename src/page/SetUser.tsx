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
  function onChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setKey(event.target.value);
  }
  const onSearch = async (keyword: string) => {
    try {
      const resUser = await User_f.get(token, keyword);
      if (resUser.status === "success") {
        setList(resUser.result || []);
      } else if (resUser.errCode === errorCode_e.TokenExpiredError) {
        const resToken = await Login_f.getToken();
        if (resToken.result?.token) {
          setToken(resToken.result.token);
        } else {
          navigate("/");
        }
      } else {
        alert("รับรายการ User ล้มเหลว");
        console.log("errCode", resUser.errCode);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onAdd = async (val: RegistFrom_t) => {
    try {
      const resUser = await User_f.post(token, val);
      if (resUser.status === "success") {
        const resGet = await User_f.get(token);
        if (resGet.status === "success" && resGet.result) {
          setList(resGet.result);
          setOpenAdd(false);
        } else {
          alert("รับรายการ User ล้มเหลว");
          console.log("errCode", resGet.errCode);
        }
      } else if (resUser.errCode === errorCode_e.TokenExpiredError) {
        const res = await Login_f.getToken();
        if (res.result?.token) {
          setToken(res.result.token);
        } else {
          navigate("/");
        }
      } else {
        alert("สร้างบัญชี User ล้มเหลว");
        console.log("errCode", resUser.errCode);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onEdit = async (val: EditUserFrom_t) => {
    try {
      const resPut = await User_f.put(token, val);
      if (resPut.status === "success") {
        const resGet = await User_f.get(token);
        if (resGet.status === "success" && resGet.result) {
          setList(resGet.result);
          setOpenEdit(false);
        } else {
          alert("รับรายการ User ล้มเหลว");
          console.log("errCode", resGet.errCode);
        }
      } else if (resPut.errCode === errorCode_e.TokenExpiredError) {
        const res = await Login_f.getToken();
        console.log("get Token");
        if (res.result?.token) {
          setToken(res.result.token);
        } else {
          navigate("/");
        }
      } else {
        alert("แก้ไข User ล้มเหลว");
        console.log("errCode", resPut.errCode);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onDel = async () => {
    try {
      const resDel = await User_f.del(token, targetID);
      if (resDel.status === "success") {
        const resGet = await User_f.get(token);
        if (resGet.status === "success" && resGet.result) {
          setList(resGet.result);
          setOpenDel(false);
        } else {
          alert("รับรายการ User ล้มเหลว");
          console.log("errCode", resGet.errCode);
        }
      } else if (resDel.errCode === errorCode_e.TokenExpiredError) {
        const res = await Login_f.getToken();
        console.log("get Token");
        if (res.result?.token) {
          setToken(res.result.token);
        } else {
          navigate("/");
        }
      } else {
        alert("ลบ User ล้มเหลว");
        console.log("errCode", resDel.errCode);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const initPage = async () => {
    try {
      const resLogin = await Login_f.getToken();
      console.log(resLogin);
      if (resLogin.status === "error" || !resLogin.result?.token) {
        navigate("/");
      } else {
        const resUser = await User_f.get(resLogin.result?.token);
        setToken(resLogin.result?.token);
        if (resUser.status === "success" && resUser.result) {
          setList(resUser.result);
          console.log(resUser);
        } else {
          alert("รับรายการ User ล้มเหลว");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  // Use Effect **************
  React.useEffect(() => {
    console.log("get user!");
    initPage();
  }, []);
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
