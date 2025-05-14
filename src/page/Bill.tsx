import React from "react";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import DialogAddContact from "../dialog/DialogAddContact";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import { Bill_t, BillList, product_t, ProductList } from "../dataSet/DataBill";
import { billType_e } from "../type";
import { IconButton, Stack } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Search_Contact_Field from "../component/Molecules/Search_Contact_Field";
import Feild_Tab from "../component/Molecules/Feild_Tab";
import Bill_Detail from "../component/Molecules/Bill_Detail";
import DialogBill from "../dialog/DialogBill";
import AddIcon from '@mui/icons-material/Add';
import DialogAddBill from "../dialog/DialogAddBill";
import DialogProductList from "../dialog/DialogProductList";

const billTabs = [
  {name: "รอชำระ", value: billType_e.not_paid},
  {name: "ชำระแล้ว", value: billType_e.already_paid},
  {name: "ที่ต้องส่ง", value: billType_e.must_delivered},
  {name: "จัดส่งสำเร็จ", value: billType_e.delivered},
];

const billOptions = [ "Next Step", "Print", "Delete" ]

const Page_Bill: React.FC = () => {
  const [ openAddContact, setOpenAddContact ] = React.useState(false);
  const [ openBillDialog, setOpenBillDialog ] = React.useState(false);
  const [ openAddBill, setOpenAddBill ] = React.useState(false);
  const [ openProductListDialog, setOpenProductListDialog ] = React.useState(false);
  const [ selectedBill, setSelectedBill ] = React.useState<Bill_t | null>(null);
  const [ selectedProduct, setSelectedProduct ] = React.useState<string[]>([]);
  const [ selectedProductBill, setSelectedProductBill ] = React.useState<product_t[]>([]);
  const [ productBillList, setProductBillList ] = React.useState<product_t[]>([]);
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
          setOpenBillDialog(false);
          setBillData(prev => prev.filter(b => b.no !== billNo));
        }
        break;
      }
      case "Print": {
        const billToPrint = billData.find(b => b.no === billNo);
        if (!billToPrint) return;

        const doc = new jsPDF();

        const billStatus = billToPrint.status === billType_e.not_paid ? "Not paid" :
                          billToPrint.status === billType_e.already_paid ? "Paid" :
                          billToPrint.status === billType_e.must_delivered ? "Must Delivered" :
                          billToPrint.status === billType_e.delivered ? "Delivered" :
                          "Not found status";

        // หัวเอกสาร
        doc.setFontSize(18);
        doc.text("Purchase Order Receipt", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Bill No: ${billToPrint.no}`, 14, 35);
        doc.text(`Date: ${billToPrint.date.toDateString()}`, 14, 43);
        doc.text(`Status: ${billStatus}`, 14, 51);
        doc.text(`Customer: ${billToPrint.billName}`, 14, 59);

        // ตารางสินค้า
        autoTable(doc, {
          startY: 70,
          head: [["Product_id", "Product_name", "Quantity", "Unit_price", "Total_amount"]],
          body: billToPrint.products?.map(p => [
            p._id ?? "-", 
            p.name ?? "-", 
            p.quantity ?? 0, 
            p.unit_price ?? 0, 
            p.total_amount ?? 0
          ]),
          styles: { font: "THSarabun", fontSize: 12 },
          headStyles: { fillColor: [0, 120, 212] },
        });

        // ยอดรวม
        const finalY = (doc as any).lastAutoTable.finalY ?? 80;
        doc.text(`Total Price: ${billToPrint.price} Bath`, 14, finalY + 10);

        // เปิดในแท็บใหม่
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");

        break;
      }
      case "Delete": {
        alert(`ลบบิลที่ ${billNo} สำเร็จ`);
        break;
      }
      case "Delete Product": {
        if(selectedProduct.length === 0){
          alert("กรุณาเลือกสินค้าก่อนลบ");
          return;
        }
        if(selectedProduct.length > 0){
          alert(`ลบสินค้า รหัส ${selectedProduct.join(", ")} จำนวน ${selectedProduct.length} รายการสำเร็จ`);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  const handleSelectedProduct = (id: string, all: boolean) => {
    if (all && selectedBill) {
      const allIds = selectedBill.products?.map(p => p._id) || [];
      const isAllSelected = selectedProduct.length === allIds.length;
      setSelectedProduct(isAllSelected ? [] : [...allIds]);
    } 
    else if(all && !selectedBill){
      const allIds = ProductList.map(p => p._id) || [];
      const isAllSelected = selectedProduct.length === allIds.length;
      setSelectedProduct(isAllSelected ? [] : [...allIds]);
    }
    else {
      setSelectedProduct(prev =>
        prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
      );
    }
  }; 

  const handleSelectedNewProduct = (product?: product_t | undefined, all: boolean = false) => {
    if (all) {
      if (selectedProductBill.length === ProductList.length) {
        setSelectedProductBill([]);
      } else {
        setSelectedProductBill(ProductList);
      }
    } 
    else if (product) {
      const exists = selectedProductBill.find(p => p._id === product._id);
      if (exists) {
        setSelectedProductBill(selectedProductBill.filter(p => p._id !== product._id));
      } else {
        setSelectedProductBill([...selectedProductBill, product]);
      }
    }
  };

  const handleDeleteProductBill = (productId: string[]) => {
    const newSelectedProductBill = productBillList.filter(p => !productId.includes(p._id));
    setProductBillList(newSelectedProductBill);
    setSelectedProduct([]);
  };

  const handleProductListConfirm = () => {
    if(selectedProductBill.length === 0){
      alert("กรุณาเลือกสินค้าก่อนเพิ่ม");
      return;
    }
    else if(selectedProductBill.length > 0){
      setProductBillList(selectedProductBill);
      setOpenProductListDialog(false);
    }
    setSelectedProductBill([]);
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
            width: { sm: "50%", md:"100%" },
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
        <IconButton
          sx={{
            position: "absolute",
            bottom: 32,
            right: 32,
            background: "#0078D4",
            '&:hover': {
              background: "#0078D4",
              opacity: 0.8,           
            }
          }}
          size="large"
          onClick={() => setOpenAddBill(true)}
        >
          <AddIcon 
            sx={{
              color: "#fff"
            }}
          />
        </IconButton>
      </Stack>
      <DialogAddContact 
        open={openAddContact} 
        onClose={()=>setOpenAddContact(false)}
      />

      <DialogAddBill 
        open={openAddBill}
        ContactData={ContactList_dataSet}
        products={productBillList} 
        selectedProduct={selectedProduct}
        openProductListDialog={openProductListDialog}
        onClose={()=>setOpenAddBill(false)}
        setProductBillList={setProductBillList}
        handleSelectedProduct={handleSelectedProduct}
        setOpenAddContact={setOpenAddContact}
        handleSelectedBillName={handleSelectedBillName}
        setOpenProductListDialog={setOpenProductListDialog}
        handleDeleteProductBill={handleDeleteProductBill}
      />

      <DialogProductList
        open={openProductListDialog}
        selectedProductBill={selectedProductBill}
        products={ProductList}
        onClose={() => setOpenProductListDialog(false)}
        setSelectedProductBill={setSelectedProductBill}
        handleSelectedNewProduct={handleSelectedNewProduct}
        handleProductListConfirm={handleProductListConfirm}
      />

      {selectedBill && (
        <DialogBill 
          open={openBillDialog} 
          onClose={() => setOpenBillDialog(false)}
          handleSelectedProduct={handleSelectedProduct}
          handleSelectedBillOption={handleSelectedBillOption}
          selectedProduct={selectedProduct} 
          bill={selectedBill}
        />
      )}
    </>
  );
};

export default Page_Bill;