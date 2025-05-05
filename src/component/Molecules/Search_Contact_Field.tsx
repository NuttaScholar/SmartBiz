import React from 'react'
import FieldContact from './FieldContact'
import { IconButton, Stack } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import { contactInfo_t } from './ContactInfo';

interface Search_Props {
    data: contactInfo_t[];
    setOpenAddContact: (enable: boolean) => void;
    selectedBillName: string;
    handleSelectedBillName: (value: string) => void;
    handleSearchBillName: () => void;
}

const Search_Contact_Field: React.FC<Search_Props> = (props) => {

  return (
    <Stack
      flexDirection='row'
      alignItems='center'
      sx={{
        width: { xs: "100%", sm: "480px" },
        background: "#E0EFFF",
        borderRadius: "8px",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      }}
    >
      <FieldContact
        list={props.data}
        onAdd={()=>props.setOpenAddContact(true)}
        placeholder="Contact"
        name="who"
        onChange={(value) => props.handleSelectedBillName(value)} 
      />
      <IconButton
        onClick={props.handleSearchBillName}       
      >
        <SearchIcon/>
      </IconButton>
    </Stack>
  )
}

export default Search_Contact_Field