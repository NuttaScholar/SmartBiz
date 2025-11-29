import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import TabBox from "../../../component/Atoms/TabBox";
import { logInfo_t, logReq_t } from "../../../API/StockService/type";
import React, { useEffect } from "react";
import TopicIcon from "@mui/icons-material/Topic";
import DialogShowImg from "../../../component/Organisms/DialogShowImg";
import stockWithRetry_f from "../lib/stockWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { stockLogType_e } from "../../../enum";

//*********************************************
// Type
//*********************************************
type headerTable_t = {
  id: "date" | "amount" | "price" | "description";
  lable: string;
  align: "left" | "right" | "center";
};
//*********************************************
// Interface
//*********************************************
interface myProps {
  productID: string;
}
//*********************************************
// Header Table
//*********************************************
const headerStockIn: headerTable_t[] = [
  {
    id: "date",
    lable: "วันที่",
    align: "left",
  },
  { id: "amount", lable: "จำนวน", align: "center" },
  { id: "price", lable: "ราคา", align: "center" },
  {
    id: "description",
    lable: "รายละเอียด",
    align: "right",
  },
];
const headerStockOut: headerTable_t[] = [
  { id: "date", lable: "วันที่", align: "left" },
  { id: "amount", lable: "จำนวน", align: "center" },
  { id: "description", lable: "รายละเอียด", align: "right" },
];
//*********************************************
// Component
//*********************************************
const TebleLog: React.FC<myProps> = (props) => {
  const auth = useAuth();
  const [rows, setRow] = React.useState<logInfo_t[]>([]);
  const [tab, setTab] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [img, setImg] = React.useState("");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);
  const handleChangePage = (event: unknown, newPage: number) => {
    console.log("New Page:", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const onOpenImg = (imgUrl: string) => {
    setImg(imgUrl);
    setOpen(true);
  };
  useEffect(() => {
    const data:logReq_t = {
      id: props.productID,
      type: tab===0?stockLogType_e.in:stockLogType_e.out,
    };
    stockWithRetry_f.getLog(auth, data).then((res) => {
      console.log("Get log:", res);
      if(res.status==="success"&&res.result!==undefined){
        setRow(res.result.logs);
      }else{
        alert("ไม่สามารถดึงข้อมูลประวัติการเปลี่ยนแปลงสต็อกได้");
      }
      
    }).catch((err) => {
      console.error("Get log error:", err);
    });
  }, [tab, props.productID]);

  return (
    <>    
      <TabBox
        list={["เติมสต็อก", "ตัดสต็อก"]}
        height="calc(100vh - 120px)"
        alignItems="center"
        onClick={setTab}
        value={tab}
        maxWidth="1280px"
      >
        <TableContainer
          component={Paper}
          elevation={4}
        >
          <Table
            sx={{ maxWidth: "1280px" }}
            stickyHeader
            aria-label="sticky table"
          >
            <TableHead>
              <TableRow>
                {tab === 0
                  ? headerStockIn.map((item, index) => (
                      <TableCell
                        key={index}
                        sx={{ py: 1, backgroundColor: "secondary.main" }}
                        align={item.align}
                      >
                        {item.lable}
                      </TableCell>
                    ))
                  : headerStockOut.map((item, index) => (
                      <TableCell
                        key={index}
                        sx={{ py: 1, backgroundColor: "secondary.main" }}
                        align={item.align}
                      >
                        {item.lable}
                      </TableCell>
                    ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    hover
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      sx={{ py: 0, height: "50px" }}
                      component="th"
                      scope="row"
                    >
                      {new Date(row.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ py: 0, height: "50px" }} align="center">
                      {row.amount}
                    </TableCell>
                    {tab === 0 && (
                      <TableCell sx={{ py: 0, height: "50px" }} align="center">
                        {row.price}
                      </TableCell>
                    )}
                    <TableCell sx={{ py: 0, height: "50px" }} align="right">
                      {tab === 0 ? (
                        <IconButton onClick={() => onOpenImg(row.bill || "")}>
                          <TopicIcon />
                        </IconButton>
                      ) : (
                        row.note
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          sx={{height:"100px"}}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}          
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TabBox>
      <DialogShowImg open={open} img={img} onClose={() => setOpen(false)} />
    </>
  );
};
export default TebleLog;
