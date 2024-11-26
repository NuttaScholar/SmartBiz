import * as React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material';

//*************************************************
// Interface
//*************************************************
interface myProps{
    children?: React.ReactNode,
    sx?: SxProps<Theme>
}
//*************************************************
// Function
//*************************************************
const Box_Mobile:React.FC<myProps> = (props) => {
  return (
    <Box sx={{...props.sx, display:{ xs: 'flex', md: 'none'} }}>
      {props.children}
    </Box>
  );
}

export default Box_Mobile;