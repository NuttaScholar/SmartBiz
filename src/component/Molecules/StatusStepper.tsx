import { Box, Step, StepLabel, Stepper } from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { forwardRef, useLayoutEffect, useRef } from "react";
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

type StatusStepItemProps = {
  step: StatusStep;
  isActive: boolean;
  isCompleted: boolean;
};

//*************************************************
// Step item component
//*************************************************
const StatusStepItem = forwardRef<HTMLDivElement, StatusStepItemProps>(
  function StatusStepItem({ step, isActive, isCompleted }, ref) {
    const StepIcon = step.Icon;

    return (
      <Step
        ref={ref}
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
              <StepIcon fontSize="small" />
            </Box>
          }
        >
          {step.label}
        </StepLabel>
      </Step>
    );
  },
);

//*************************************************
// Main component
//*************************************************
export function StatusStepper({
  statusStepList,
  status,
}: StatusStepperProps) {
  const activeStep = statusStepList.findIndex((step) => step.value === status);
  const minWidth = Math.max(statusStepList.length * 112, 280);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const activeStepElement = activeStepRef.current;

    if (!scrollContainer || !activeStepElement) return;
    if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) return;

    scrollContainer.scrollTo({
      left: Math.max(activeStepElement.offsetLeft - 16, 0),
      behavior: "auto",
    });
  }, [activeStep, statusStepList]);

  return (
    <Box
      ref={scrollContainerRef}
      sx={{ width: "100%", overflowX: "auto", pt: 2 }}
    >
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
        {statusStepList.map((step, index) => (
          <StatusStepItem
            key={step.value}
            ref={index === activeStep ? activeStepRef : undefined}
            step={step}
            isCompleted={index < activeStep}
            isActive={index === activeStep}
          />
        ))}
      </Stepper>
    </Box>
  );
}
