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
  useTheme,
} from "@mui/material";
import TabBox from "../../../component/Atoms/TabBox";
import { stockLog_t } from "../../../API/StockService/type";
import React from "react";
import TopicIcon from "@mui/icons-material/Topic";
import DialogShowImg from "../../../component/Organisms/DialogShowImg";
//*********************************************
// Deta set
//*********************************************
const rows: stockLog_t[] = [
  {
    date: new Date("2024-06-01"),
    amount: 50,
    price: 5000,
    description: "http://localhost:9000/product/01B004_3d5e5b77e2fae639",
  },
  {
    date: new Date("2024-06-05"),
    amount: -20,
    price: 2000,
    description: "http://localhost:9000/product/01B002_c78d5154ef68904c",
  },
  {
    date: new Date("2024-06-10"),
    amount: 30,
    price: 3000,
    description: "http://localhost:9000/product/01B004_49eb0c32886baaf7",
  },
  {
    date: new Date("2024-06-15"),
    amount: -10,
    price: 1000,
    description: "ตัดสต็อกสินค้า A",
  },
  {
    date: new Date("2024-06-01"),
    amount: 50,
    price: 5000,
    description: "http://localhost:9000/product/01B004_3d5e5b77e2fae639",
  },
  {
    date: new Date("2024-06-05"),
    amount: -20,
    price: 2000,
    description: "http://localhost:9000/product/01B002_c78d5154ef68904c",
  },
  {
    date: new Date("2024-06-10"),
    amount: 30,
    price: 3000,
    description: "http://localhost:9000/product/01B004_49eb0c32886baaf7",
  },
  {
    date: new Date("2024-06-15"),
    amount: -10,
    price: 1000,
    description: "ตัดสต็อกสินค้า A",
  },
  {
    date: new Date("2024-06-01"),
    amount: 50,
    price: 5000,
    description: "http://localhost:9000/product/01B004_3d5e5b77e2fae639",
  },
  {
    date: new Date("2024-06-05"),
    amount: -20,
    price: 2000,
    description: "http://localhost:9000/product/01B002_c78d5154ef68904c",
  },
  {
    date: new Date("2024-06-10"),
    amount: 30,
    price: 3000,
    description: "http://localhost:9000/product/01B004_49eb0c32886baaf7",
  },
  {
    date: new Date("2024-06-15"),
    amount: -10,
    price: 1000,
    description: "ตัดสต็อกสินค้า A",
  },
  {
    date: new Date("2024-06-01"),
    amount: 50,
    price: 5000,
    description: "http://localhost:9000/product/01B004_3d5e5b77e2fae639",
  },
  {
    date: new Date("2024-06-05"),
    amount: -20,
    price: 2000,
    description: "http://localhost:9000/product/01B002_c78d5154ef68904c",
  },
  {
    date: new Date("2024-06-10"),
    amount: 30,
    price: 3000,
    description: "http://localhost:9000/product/01B004_49eb0c32886baaf7",
  },
  {
    date: new Date("2024-06-15"),
    amount: -10,
    price: 1000,
    description: "ตัดสต็อกสินค้า A",
  },
];
//*********************************************
// Type
//*********************************************
type headerTable_t = {
  id: "date" | "amount" | "price" | "description";
  lable: string;
  align: "left" | "right" | "center";
};
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
const TebleLog: React.FC = () => {
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
                      {row.date.toLocaleDateString()}
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
                        <IconButton onClick={() => onOpenImg(row.description)}>
                          <TopicIcon />
                        </IconButton>
                      ) : (
                        row.description
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
