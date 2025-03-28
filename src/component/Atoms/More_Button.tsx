import React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';

const More_Button: React.FC = () => {
  return (
    <IconButton aria-label="more" color="inherit" 
        sx={{ 
            position: "absolute",
            right: 56,
            bottom: 56,
            background: "#0078D4", 
            "&:hover": {
                background: "#0078D4",
            },
            "&:hover .MuiSvgIcon-root": {
                color: "white",
            },
        }}
    >
        <MoreVertIcon/>
    </IconButton>
  )
}

export default More_Button;
