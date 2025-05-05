import React from 'react'
import { billType_e } from '../../type';
import { Stack, Tab } from '@mui/material'

interface Tab_Prop {
    name: string;
    value: number;
}

interface Feild_Props {
    tabs: Tab_Prop[];
    selectedTab: number;
    handleSelectedTab: (value: billType_e) => void;
}

const Feild_Tab: React.FC<Feild_Props> = (props) => {

  return (
    <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{
            width: "100%",
            height: "56px",
            marginTop: "8px",
            background: "#E0EFFF",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
    >
        {props.tabs.map((tab, index) => (
            <Tab 
                key={index}
                label={tab.name} 
                value={tab.value}
                sx={{
                    width: "23%",
                    height: "40px",
                    border: "1px solid #0000001F",
                    borderRadius: "4px",
                    background: "#fff",
                    color: props.selectedTab === tab.value ? "#0078D4" : undefined,
                    borderBottom: props.selectedTab === tab.value ? "2px solid #0078D4" : undefined, 
                }}
                onClick={() => props.handleSelectedTab(tab.value)}
            />
        ))}    
    </Stack>
  )
}

export default Feild_Tab