import React from "react";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import DialogAddContact from "../dialog/DialogAddContact";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import { Bill_t, BillList } from "../dataSet/DataBill";
import { billType_e } from "../type";
import { Stack } from "@mui/material";
import Search_Contact_Field from "../component/Molecules/Search_Contact_Field";
import Feild_Tab from "../component/Molecules/Feild_Tab";
import Bill_Detail from "../component/Molecules/Bill_Detail";
import DialogBill from "../dialog/DialogBill";

const billTabs = [
  {name: "รอชำระ", value: billType_e.not_paid},
  {name: "ชำระแล้ว", value: billType_e.already_paid},
  {name: "ที่ต้องส่ง", value: billType_e.must_delivered},
  {name: "จัดส่งสำเร็จ", value: billType_e.delivered},
];

const billOptions = [ "Next Step", "Print", "Delete", "Add" ]

const Page_Bill: React.FC = () => {
  const [ openAddContact, setOpenAddContact ] = React.useState(false);
  const [ openBillDialog, setOpenBillDialog ] = React.useState(false);
  const [ openAddBill, setOpenAddBill ] = React.useState(false);
  const [ selectedBill, setSelectedBill ] = React.useState<Bill_t | null>(null);
  const [ openBillOptionNo, setOpenBillOptionNo ] = React.useState<number | null>(null);
  const [ selectedBillName, setSelectedBillName ] = React.useState<string>("");
  const [ selectedTab, setSelectedTab ] = React.useState(billTabs[0].value);
  const [ billData, setBillData ] = React.useState(BillList.filter(bill => bill.status === billTabs[0].value));

  const handleSelectedBillName = (value: string) => {
    setSelectedBillName(value);
  };
  
  const handleSearchBillName = () => {
    if(selectedBillName === ""){
      setBillData(BillList.filter(bill => bill.status === selectedTab));
      return;
    }
    setBillData(BillList.filter(bill => (bill.billName === selectedBillName && bill.status === selectedTab)));
  }

  const handleSelectedTab = (value: billType_e) => {
    setSelectedTab(value);
    setBillData(BillList.filter(bill => bill.status === value));
  };

  const handleBillDialog = (bill: Bill_t) => {
    setSelectedBill(bill);
    setOpenBillDialog(true);
  }

  const handleSelectedBillOption = (value: string, billNo: number) => {
    const selectedBillIndex = billData.findIndex(b => b.no === billNo);
    if (selectedBillIndex === -1) return;
    
    const selectedBill = billData[selectedBillIndex];

    switch(value){
      case "Next Step": {
        const currentStatusIndex = billTabs.findIndex(tab => tab.value === selectedBill.status);
        if (currentStatusIndex >= 0 && currentStatusIndex < billTabs.length - 1) {
          const nextStatus = billTabs[currentStatusIndex + 1].value;

          const billIndexInList = BillList.findIndex(b => b.no === billNo);
          if (billIndexInList !== -1) {
            BillList[billIndexInList] = {
              ...BillList[billIndexInList],
              status: nextStatus,
            };
          }

          setBillData(prev => prev.filter(b => b.no !== billNo));
        }
        break;
      }
      case "Print": {
        break;
      }
      case "Delete": {
        break;
      }
      case "Add": {
        break;
      }
      default: {
        break;
      }
    }
  }

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
        <Search_Contact_Field
          data={ContactList_dataSet}
          setOpenAddContact={setOpenAddContact}
          selectedBillName={selectedBillName}
          handleSelectedBillName={handleSelectedBillName}
          handleSearchBillName={handleSearchBillName}
        />

        <Feild_Tab
          tabs={billTabs}
          selectedTab={selectedTab}
          handleSelectedTab={handleSelectedTab}
        />
        
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
          {billData.map((bill) => (
            <Bill_Detail 
              key={bill.no} 
              bill={bill} 
              billOptions={billOptions}
              openBillOptionNo={openBillOptionNo}
              setOpenBillOptionNo={setOpenBillOptionNo}
              handleSelectedBillOption={handleSelectedBillOption}
              handleBillDialog={() => handleBillDialog(bill)}
            />
          ))}
        </Stack>
      </Stack>
      <DialogAddContact open={openAddContact} onClose={()=>setOpenAddContact(false)}/>
      <DialogBill open={openBillDialog} onClose={()=>setOpenBillDialog(false)} bill={selectedBill}/>
    </>
  );
};

export default Page_Bill;