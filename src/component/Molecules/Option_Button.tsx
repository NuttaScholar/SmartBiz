import { SpeedDial, SpeedDialAction } from "@mui/material";
import React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

interface myProps {
    onOpenDialog: () => void;
}

const actions = [
    { icon: <AddIcon />, name: "Add", action: "openDialog" },
    { icon: <HomeIcon />, name: "Home" },
];

const Option_Button: React.FC<myProps> = (props) => {

  return (
    <SpeedDial
        ariaLabel="SpeedDial options"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<MoreVertIcon />}
    >
        {actions.map((action) => (
            <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action === "openDialog" ? props.onOpenDialog : undefined}
            />
        ))}
    </SpeedDial>
  )
}

export default Option_Button;
