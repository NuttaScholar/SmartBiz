import { Box, Step, StepLabel, Stepper } from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

//*************************************************
// Types
//*************************************************
export type StatusStep = {
  value: number;
  label: string;
  Icon: ComponentType<SvgIconProps>;
};

type StatusStepperProps = {
  statusStepList: readonly StatusStep[];
  status: number;
};

//*************************************************
// Main component
//*************************************************
export function StatusStepper({
  statusStepList,
  status,
}: StatusStepperProps) {
  const activeStep = statusStepList.findIndex((step) => step.value === status);
  const minWidth = Math.max(statusStepList.length * 112, 280);

  return (
    <Box sx={{ width: "100%", overflowX: "auto", pt: 2 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        aria-label="สถานะ"
        sx={{
          minWidth,
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "primary.main",
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "success.main",
          },
        }}
      >
        {statusStepList.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <Step
              key={step.value}
              completed={isCompleted}
              aria-current={isActive ? "step" : undefined}
            >
              <StepLabel
                icon={
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      color: isCompleted
                        ? "success.contrastText"
                        : isActive
                          ? "primary.contrastText"
                          : "text.disabled",
                      bgcolor: isCompleted
                        ? "success.main"
                        : isActive
                          ? "primary.main"
                          : "action.disabledBackground",
                    }}
                  >
                    <step.Icon fontSize="small" />
                  </Box>
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
