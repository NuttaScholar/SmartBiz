import * as React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material';

//*************************************************
// Interface
//*************************************************
interface myProps{
    children?: React.ReactNode,
    sx?: SxProps<Theme>,
    component?: React.ElementType,
    'aria-label'?: string
}
//*************************************************
// Function
//*************************************************
const Box_Mobile:React.FC<myProps> = (props) => {
  return (
    <Box component={props.component ?? 'div'} aria-label={props['aria-label']} sx={{...props.sx, display:{ xs: 'flex', md: 'none'} }}>
      {props.children}
    </Box>
  );
}

export default Box_Mobile;
