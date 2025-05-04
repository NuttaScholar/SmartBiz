import React from "react";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import FieldContact from "../component/Molecules/FieldContact";
import DialogAddContact, { ContactForm_t } from "../dialog/DialogAddContact";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import { BillList } from "../dataSet/DataBill";
import { billType_e } from "../type";
import { IconButton, Stack, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const getColorByStatus = (status: billType_e): string => {
  switch (status) {
    case billType_e.not_paid: return "red";
    case billType_e.already_paid: return "green";
    case billType_e.must_delivered: return "orange";
    case billType_e.delivered: return "blue";
    default: return "black";
  }
};

const Page_Bill: React.FC = () => {
  const [openAddContact, setOpenAddContact] = React.useState(false);

  console.log(BillList)
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.bill} />
      <Stack
        alignItems='center'
        justifyContent='center'
        sx={{
          marginTop: "32px"
        }}
      >
        <Stack
          flexDirection='row'
          alignItems='center'
          sx={{
            width: "350px",
            background: "#E0EFFF",
            borderRadius: "8px",
          }}
        >
          <FieldContact
            list={ContactList_dataSet}
            onAdd={()=>setOpenAddContact(true)}
            placeholder="Contact"
            name="who" 
          />
          <IconButton>
            <SearchIcon 
            />
          </IconButton>
        </Stack>
        
        <Stack
          direction='row'
          flexWrap='wrap'
          alignItems='center'
          justifyContent='center'
          gap={2}
          sx={{
            marginTop: "32px",
            width: "80%",
          }}
        >        
          {BillList.map((bill, index) => (
            <Stack 
              key={index} 
              direction="column" 
              alignItems="center"
              sx={{
                width: "516px",
                border: "1px solid",
                borderRadius: "8px",
                background: "#E0EFFF"
              }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                sx={{
                  width: "100%",
                }}
              >
                <Stack 
                  direction="column"
                  sx={{
                    padding: "4px 8px",
                  }}
                >
                  <Stack direction="row" alignItems='baseline'>
                    <Typography variant="h6">Bill No.: </Typography>
                    <Typography variant="body1">{bill.no}</Typography>
                  </Stack>

                  <Stack direction="row" alignItems='baseline'>
                    <Typography variant="h6">Date: </Typography>
                    <Typography variant="body1">{bill.date.toLocaleDateString()}</Typography>
                  </Stack>
                </Stack>

                <Stack 
                  direction="column"
                  sx={{
                    padding: "4px 8px",
                  }}
                >
                  <Stack direction="row" alignItems='baseline'>
                    <Typography variant="h6">สถานะ: </Typography>
                    <Typography variant="body1"
                      sx={{ color: getColorByStatus(bill.status) }}
                    >
                      {bill.status === billType_e.not_paid && "ยังไม่ได้ชำระ"}
                      {bill.status === billType_e.already_paid && "ชำระแล้ว"}
                      {bill.status === billType_e.must_delivered && "ที่ต้องส่ง"}
                      {bill.status === billType_e.delivered && "ส่งแล้ว"}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                sx={{
                  width: "100%",
                }}
              >
                <Stack 
                  direction="column"
                  sx={{
                    padding: "4px 8px",
                  }}
                >
                  <Stack direction="row" alignItems='baseline'>
                    <Typography variant="h6">ลูกค้า: </Typography>
                    <Typography variant="body1">{bill.billName}</Typography>
                  </Stack>

                  <Stack direction="row" alignItems='baseline'>
                    <Typography variant="h6">ยอด: </Typography>
                    <Typography variant="body1">{bill.price}</Typography>
                  </Stack>
                </Stack>

                <Stack 
                  direction="column"
                  sx={{
                    padding: "4px 8px",
                  }}
                >
                  <Stack direction="row" alignItems='baseline'>
                    <IconButton>
                      <MoreHorizIcon/>
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>   
            </Stack>
          ))}
        </Stack>
      </Stack>
      <DialogAddContact open={openAddContact} onClose={()=>setOpenAddContact(false)}/>
    </>
  );
};

export default Page_Bill;