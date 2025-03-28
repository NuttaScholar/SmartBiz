import { Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react'

interface SearchFieldProps {
    onSearchChange: (term: string) => void;
}

const Search_Field: React.FC<SearchFieldProps> = ({ onSearchChange }) => {
    const [search, setSearch] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  };

  const handleSearch = () => {
    onSearchChange(search);
  };
  
  return (
    <Stack 
        direction="row"
        justifyContent="center"
        alignItems="center"
        gap={2}
        sx={{
            background: "#E0EFFF",
            width: { xs: "90%", sm: "480px" },
            margin: "auto",
            padding: "10px 16px",
            borderRadius: "8px"
        }}
    >
        <TextField
            id="outlined-basic" 
            label={
                <Stack direction="row" alignItems="center" gap={1}>
                    <SearchIcon sx={{ fontSize: 20 }} />
                    <span>รหัสสินค้า</span>
                </Stack>
            }
            variant="outlined"
            sx={{
                width: { xs: "260px", sm: "380px" },
                background: "#fff"
            }}
            fullWidth
            value={search}
            onChange={handleChange}
        />
        <SearchIcon
            sx={{ 
                ":hover": {
                    cursor: "pointer",
                    color: "#0078D4"
                }
            }}
            onClick={handleSearch}
        />
    </Stack>
  )
}

export default Search_Field;
