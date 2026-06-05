import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ContactInfo_t } from "../../API/AccountService/type";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import contactWithRetry_f from "../../page/Access/lib/contactWithRetry";
import { ErrorString } from "../../function/Enum";
import { errorCode_e } from "../../enum";
import { contactInfo_t } from "../Molecules/ContactInfo";
import HeaderDialog_Search from "../Molecules/HeaderDialog_Search";
import FieldSearch from "../Molecules/FieldSearch";
import ListContact from "../Molecules/ListContact";
//*********************************************
// Type
//*********************************************

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  list: contactInfo_t[];
  onSelect?: (codeName: string) => void;
  onClose?: () => void;
  onAdd?: () => void;
  onEdit?: (val: ContactInfo_t) => void;
  onChange: (list: contactInfo_t[]) => void;
}
//*********************************************
// Component
//*********************************************
const DialogContactList: React.FC<myProps> = (props) => {
  // Hook *********************
  const navigate = useNavigate();
  const authContext = useAuth();
  const [keySearch, setKeySearch] = React.useState<string>("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const pageSize = 30;

  // Local Function ***********
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeySearch(event.target.value);
  };

  const loadContacts = React.useCallback(
    async (index: number, append = false, keyword = keySearch) => {
      if (isLoading) return;

      setIsLoading(true);

      contactWithRetry_f
        .get(authContext, {
          id: keyword,
          index,
          size: pageSize,
        })
        .then((val) => {
          if (val.data) {
            props.onChange?.(append ? [...props.list, ...val.data] : val.data);
            setPageIndex(index);
            setHasMore(val.hasMore ?? false);
          } else if (val.errCode) {
            alert(ErrorString(val.errCode));
            if (val.errCode === errorCode_e.TokenExpiredError) {
              navigate("/");
            }
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [authContext, isLoading, keySearch, navigate, props, pageSize],
  );

  const onSearch = async (keyword: string) => {
    loadContacts(0, false, keyword);
  };

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom < 160 && hasMore && !isLoading) {
      loadContacts(pageIndex + 1, true);
    }
  };

  React.useEffect(() => {
    if (!props.open) return;

    setPageIndex(0);
    setHasMore(true);
    loadContacts(0, false);
    // This effect intentionally reloads only when the dialog opens.
    // `loadContacts` also changes with pagination/loading state and would otherwise retrigger the initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const onDelContacat = async (data: contactInfo_t) => {
    contactWithRetry_f
      .del(authContext, data)
      .then((res) => {
        if (res.success) {
          res.data && props.onChange(res.data);
        } else {
          res.errCode && alert(ErrorString(res.errCode));
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
  };
  return (
    <>
      <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        slots={{
          transition: Transition,
        }}
      >
        <HeaderDialog_Search
          label="รายชื่อผู้ติดต่อ"
          onBack={props.onClose}
          onChange={onChangeHandler}
          onAdd={props.onAdd}
          value={keySearch}
          onSearch={onSearch}
        />
        <Box
          onScroll={onScroll}
          sx={{
            my: "64px",
            height: "calc(100vh - 128px)",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <FieldSearch
              label="Search"
              display={{ xs: "flex", sm: "none" }}
              value={keySearch}
              onChange={onChangeHandler}
              onSubmit={onSearch}
            />
          </Box>
          <ListContact
            list={props.list}
            onClick={props.onSelect}
            onDel={onDelContacat}
            onEdit={props.onEdit}
          />
        </Box>
      </Dialog>      
    </>
  );
};
export default DialogContactList;
