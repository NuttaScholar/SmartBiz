import { Alert, Box, Button, Chip, Container, Divider, List, ListItem, ListItemText, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { billStatus_e } from '../../../enum';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { formatMoney, statusColor, statusLabel } from '../lib/format';
import { getStoredOrders } from '../lib/orderStorage';

export function OrderDetailPage() {
  const { customerToken, orderID = "" } = useParams<{ customerToken: string; orderID: string }>();
  const navigate = useNavigate();
  const order = getStoredOrders(customerToken ?? "").find((item) => item.id === orderID);

  return (
    <StorefrontLayout>
      <Container maxWidth="md" className="storefront-content">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/storefront/${customerToken}/orders`)}>
          กลับไปประวัติ
        </Button>
        {!order ? (
          <Alert severity="warning" className="detail-alert">
            ไม่พบคำสั่งซื้อที่ต้องการ
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Paper variant="outlined" className="detail-panel">
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h4">{order.id}</Typography>
                  <Typography color="text.secondary">
                    {new Date(order.date).toLocaleString("th-TH")}
                  </Typography>
                </Box>
                <Chip label={statusLabel(order.status)} color={statusColor(order.status)} />
              </Stack>
              <Tabs value={order.status} variant="scrollable" scrollButtons="auto" className="status-tabs">
                <Tab value={billStatus_e.PrepareProduct} label="เตรียมสินค้า" />
                <Tab value={billStatus_e.PrepareShipment} label="เตรียมจัดส่ง" />
                <Tab value={billStatus_e.Billing} label="ออกบิล" />
                <Tab value={billStatus_e.WaitingPayment} label="รอชำระ" />
                <Tab value={billStatus_e.Completed} label="สำเร็จ" />
              </Tabs>
            </Paper>
            <Paper variant="outlined" className="detail-panel">
              <Typography variant="h6">รายการสินค้า</Typography>
              <List disablePadding>
                {order.items.map((item) => (
                  <ListItem key={item.productID} disableGutters className="detail-item">
                    <img src={item.img} alt={item.name} className="detail-image" />
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} x ${formatMoney(item.priceAfterDiscount)} | ส่วนลด ${item.discountPercent}%`}
                    />
                    <Typography fontWeight={600}>
                      {formatMoney(item.quantity * item.priceAfterDiscount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">ยอดรวมที่ต้องชำระ</Typography>
                <Typography variant="h5" color="primary.dark">
                  {formatMoney(order.totalAmount)}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Container>
    </StorefrontLayout>
  );
}
