import React from "react";
import { Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useNavigate } from "react-router-dom";
import HeaderDialog from "../Molecules/HeaderDialog";
//*********************************************
// Style
//*********************************************

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  onClose?: () => void;
}
//*********************************************
// Component
//*********************************************
const DialogSePass: React.FC<myProps> = (props) => {
  // Local Function **************
  // Hook **************
  const navigate = useNavigate();

  // Local Function **************

  // Use Effect **************
  React.useEffect(() => {
    console.log("get user!");
  }, [props.open]);
  return (
    <>
      <Dialog
        fullScreen
        open={props.open}
        onClose={props.onClose}
        slots={{
          transition: Transition,
        }}
      >
        <HeaderDialog
          label="Set User"
          onClick={props.onClose}
        />
        
      </Dialog>
    </>
  );
};
export default DialogSePass;
