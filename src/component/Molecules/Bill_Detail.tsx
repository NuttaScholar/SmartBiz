import React from 'react'
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Bill_t } from '../../dataSet/DataBill'
import { billType_e } from '../../type';

interface Bill_Detail_Props {
  bill: Bill_t;
  billOptions?: string[];
  openBillOptionNo?: number | null;
  setOpenBillOptionNo?: (value: number | null) => void;
  handleSelectedBillOption?: (value: string, index: number) => void;
  handleBillDialog?: () => void;
}

const getColorByStatus = (status: billType_e): string => {
  switch (status) {
    case billType_e.not_paid: return "red";
    case billType_e.already_paid: return "green";
    case billType_e.must_delivered: return "orange";
    case billType_e.delivered: return "blue";
    default: return "black";
  }
};

const Bill_Detail: React.FC<Bill_Detail_Props> = (props) => {
  const [ anchorEl, setAnchorEl ] = React.useState<null | HTMLElement>(null);

  return (
    <Stack 
      direction="column" 
      alignItems="center"
      sx={{
        width: "516px",
        border: "1px solid",
        borderRadius: "8px",
        background: "#E0EFFF",
        ...(props.billOptions && {
          ":hover": {
            cursor: "pointer"
          }
        })
      }}
      onClick={() => props.handleBillDialog?.()}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{
          width: "100%",
        }}
      >
        <Stack 
          direction="column"
          sx={{
            padding: "4px 8px",
          }}
        >
          <Stack direction="row" gap={1} alignItems='baseline'>
            <Typography variant="h6">Bill No.: </Typography>
            <Typography variant="body1">{props.bill.no}</Typography>
          </Stack>

          <Stack direction="row" gap={1} alignItems='baseline'>
            <Typography variant="h6">Date: </Typography>
            <Typography variant="body1">{props.bill.date.toLocaleDateString()}</Typography>
          </Stack>
        </Stack>

        <Stack 
          direction="column"
          sx={{
            padding: "4px 8px",
          }}
        >
          <Stack direction="row" gap={1} alignItems='baseline'>
            <Typography variant="h6">สถานะ: </Typography>
            <Typography variant="body1"
              sx={{ color: getColorByStatus(props.bill.status) }}
            >
              {props.bill.status === billType_e.not_paid && "ยังไม่ได้ชำระ"}
              {props.bill.status === billType_e.already_paid && "ชำระแล้ว"}
              {props.bill.status === billType_e.must_delivered && "ที่ต้องส่ง"}
              {props.bill.status === billType_e.delivered && "ส่งแล้ว"}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{
          width: "100%",
        }}
      >
        <Stack 
          direction="column"
          sx={{
            padding: "4px 8px",
          }}
        >
          <Stack direction="row" gap={1} alignItems='baseline'>
            <Typography variant="h6">ลูกค้า: </Typography>
            <Typography variant="body1">{props.bill.billName}</Typography>
          </Stack>

          <Stack direction="row" gap={1} alignItems='baseline'>
            <Typography variant="h6">ยอด: </Typography>
            <Typography variant="body1">{props.bill.price}</Typography>
          </Stack>
        </Stack>

        {props.billOptions && (
          <Stack 
            direction="column"
            sx={{
              padding: "4px 8px",
            }}
          >
            <Stack direction="row" alignItems='baseline'>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setAnchorEl(event.currentTarget)
                }}
              >
                <MoreHorizIcon/>
              </IconButton>
            </Stack>

            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={(event: React.MouseEvent<HTMLElement> | Event) => {
                event.stopPropagation();
                setAnchorEl(null);
              }}
            >
              {props.billOptions?.map((option, index) => {
                const shouldRender = props.bill.status !== billType_e.delivered || option !== "Next Step";

                return shouldRender ? (
                  <MenuItem 
                    key={index}
                    onClick={(event) => {
                      event.stopPropagation();
                      props.handleSelectedBillOption?.(option, props.bill.no);
                      setAnchorEl(null);
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>
                      {option}
                    </Typography>
                  </MenuItem>
                ) : null;
              })}
            </Menu>
          </Stack>
        )}
      </Stack>   
    </Stack>
  )
}

export default Bill_Detail