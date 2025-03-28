import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import React from 'react'

interface FilterFieldProps {
    isMine: boolean[],
    status: number[],
    selectedIsMine: string,
    selectedStatus: string,
    onFilterChange: (isMine: string, status: string) => void;
}

const Filter_Field: React.FC<FilterFieldProps> = ({ isMine, status, selectedIsMine, selectedStatus, onFilterChange }) => {

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
        <FilterAltIcon/>
        <FormControl sx={{ m: 1, minWidth: 100, width: "50%", background: "#fff" }}>
            <InputLabel id="demo-simple-select-autowidth-label">เจ้าของ</InputLabel>
            <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={selectedIsMine} 
                onChange={(e) => onFilterChange(e.target.value, selectedStatus)}
                autoWidth
                label="เจ้าของ"
            >
                <MenuItem value="ทั้งหมด">ทั้งหมด</MenuItem>
                {isMine.map((item, index) => (
                    <MenuItem key={index} value={item ? "เจ้าของ" : "ไม่ใช่เจ้าของ"}>
                        {item ? "เจ้าของ" : "ไม่ใช่เจ้าของ"}
                    </MenuItem>
                ))} 
            </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 100, width: "50%", background: "#fff" }}>
            <InputLabel id="demo-simple-select-autowidth-label">สถานะ</InputLabel>
            <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={selectedStatus}
                onChange={(e) => onFilterChange(selectedIsMine, e.target.value)}
                autoWidth
                label="สถานะ"
            >
                <MenuItem value="ทั้งหมด">ทั้งหมด</MenuItem>
                {status.map((item, index) => (
                    <MenuItem key={index} value={item ? "เปิดใช้งาน" : "ปิดใช้งาน"}>
                        {item ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </MenuItem>
                ))} 
            </Select>
        </FormControl>
    </Stack>
  )
}

export default Filter_Field;
