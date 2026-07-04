import React from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import theme from "../../../src/theme";
import { billStatus_e, stockStatus_e } from "../../../src/enum";
import "./style.css";

type StorefrontProduct = {
  id: string;
  name: string;
  img: string;
  description: string;
  price: number;
  amount: number;
  percentDiscount: number;
  priceAfterDiscount: number;
  status: stockStatus_e;
};

type CustomerSession = {
  customerID: string;
  customerName: string;
  token: string;
};

type CartItem = {
  productID: string;
  quantity: number;
};

type StorefrontOrder = {
  id: string;
  customerID: string;
  date: string;
  status: billStatus_e;
  totalAmount: number;
  items: Array<{
    productID: string;
    name: string;
    quantity: number;
    priceOriginal: number;
    discountPercent: number;
    priceAfterDiscount: number;
    img: string;
  }>;
};

const mockProducts: StorefrontProduct[] = [
  {
    id: "P-1001",
    name: "ชุดของขวัญกาแฟคั่วกลาง",
    img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
    description: "เมล็ดกาแฟพร้อมแก้วเซรามิก สำหรับลูกค้าที่ชอบของขวัญเรียบง่าย",
    price: 690,
    amount: 18,
    percentDiscount: 10,
    priceAfterDiscount: 621,
    status: stockStatus_e.normal,
  },
  {
    id: "P-1002",
    name: "กล่องคุกกี้ธัญพืช",
    img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
    description: "คุกกี้อบใหม่ แพ็กกล่องพร้อมขาย",
    price: 320,
    amount: 9,
    percentDiscount: 5,
    priceAfterDiscount: 304,
    status: stockStatus_e.normal,
  },
  {
    id: "P-1003",
    name: "น้ำผึ้งดอกลำไย",
    img: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80",
    description: "น้ำผึ้งแท้ ขนาด 500 กรัม",
    price: 250,
    amount: 4,
    percentDiscount: 0,
    priceAfterDiscount: 250,
    status: stockStatus_e.stockLow,
  },
  {
    id: "P-1004",
    name: "สบู่สมุนไพรแพ็ก 4 ชิ้น",
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    description: "สบู่กลิ่นอ่อนโยน เหมาะกับชุดของฝาก",
    price: 180,
    amount: 22,
    percentDiscount: 12,
    priceAfterDiscount: 158.4,
    status: stockStatus_e.normal,
  },
  {
    id: "P-1005",
    name: "กระเป๋าผ้าพิมพ์ลาย",
    img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    description: "กระเป๋าผ้าแคนวาส ใช้ซ้ำได้",
    price: 220,
    amount: 0,
    percentDiscount: 0,
    priceAfterDiscount: 220,
    status: stockStatus_e.stockOut,
  },
  {
    id: "P-1006",
    name: "เซ็ตชาไทยพร้อมชง",
    img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    description: "ชาไทย กลิ่นหอม พร้อมสูตรชงมาตรฐาน",
    price: 410,
    amount: 13,
    percentDiscount: 8,
    priceAfterDiscount: 377.2,
    status: stockStatus_e.normal,
  },
];

const seededOrders: StorefrontOrder[] = [
  {
    id: "SO-260704-001",
    customerID: "CUST-001",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: billStatus_e.PrepareShipment,
    totalAmount: 925,
    items: [
      {
        productID: "P-1001",
        name: "ชุดของขวัญกาแฟคั่วกลาง",
        quantity: 1,
        priceOriginal: 690,
        discountPercent: 10,
        priceAfterDiscount: 621,
        img: mockProducts[0].img,
      },
      {
        productID: "P-1002",
        name: "กล่องคุกกี้ธัญพืช",
        quantity: 1,
        priceOriginal: 320,
        discountPercent: 5,
        priceAfterDiscount: 304,
        img: mockProducts[1].img,
      },
    ],
  },
  {
    id: "SO-260704-002",
    customerID: "CUST-001",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: billStatus_e.WaitingPayment,
    totalAmount: 754.4,
    items: [
      {
        productID: "P-1006",
        name: "เซ็ตชาไทยพร้อมชง",
        quantity: 2,
        priceOriginal: 410,
        discountPercent: 8,
        priceAfterDiscount: 377.2,
        img: mockProducts[5].img,
      },
    ],
  },
];

function getStoredOrders(token: string) {
  const rawValue = window.localStorage.getItem(`smartbiz-storefront-orders-${token}`);
  if (!rawValue) return seededOrders;

  try {
    return JSON.parse(rawValue) as StorefrontOrder[];
  } catch {
    return seededOrders;
  }
}

function saveStoredOrders(token: string, orders: StorefrontOrder[]) {
  window.localStorage.setItem(`smartbiz-storefront-orders-${token}`, JSON.stringify(orders));
}

function formatMoney(value: number) {
  return value.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
}

function statusLabel(status: billStatus_e) {
  switch (status) {
    case billStatus_e.PrepareProduct:
      return "เตรียมสินค้า";
    case billStatus_e.PrepareShipment:
      return "เตรียมจัดส่ง";
    case billStatus_e.Billing:
      return "ออกบิล";
    case billStatus_e.WaitingPayment:
      return "รอชำระเงิน";
    case billStatus_e.Completed:
      return "สำเร็จ";
    default:
      return "ไม่ทราบสถานะ";
  }
}

function statusColor(status: billStatus_e) {
  switch (status) {
    case billStatus_e.Completed:
      return "success";
    case billStatus_e.WaitingPayment:
      return "error";
    case billStatus_e.Billing:
      return "info";
    default:
      return "warning";
  }
}

function stockLabel(product: StorefrontProduct) {
  if (product.status === stockStatus_e.stockOut || product.amount <= 0) return "สินค้าหมด";
  if (product.status === stockStatus_e.stockLow) return "ใกล้หมด";
  return `คงคลัง ${product.amount}`;
}

function useStorefrontSession() {
  const { customerToken = "" } = useParams<{ customerToken: string }>();
  const [session, setSession] = React.useState<CustomerSession>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    window.setTimeout(() => {
      if (!active) return;
      if (!customerToken || customerToken === "invalid") {
        setSession(undefined);
        setError("ลิงก์ลูกค้าไม่ถูกต้องหรือหมดอายุ");
      } else {
        setSession({
          customerID: "CUST-001",
          customerName: "คุณลูกค้า SmartBiz",
          token: customerToken,
        });
      }
      setIsLoading(false);
    }, 250);

    return () => {
      active = false;
    };
  }, [customerToken]);

  return { customerToken, session, isLoading, error };
}

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { customerToken, session, isLoading, error } = useStorefrontSession();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box className="storefront-center">
        <CircularProgress />
        <Typography color="text.secondary">กำลังตรวจสอบลิงก์ลูกค้า</Typography>
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Container maxWidth="sm" className="storefront-error">
        <Alert severity="error">{error || "ไม่พบข้อมูลลูกค้า"}</Alert>
      </Container>
    );
  }

  return (
    <Box className="storefront-shell">
      <AppBar position="sticky" elevation={0} color="inherit" className="storefront-appbar">
        <Toolbar className="storefront-toolbar">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box className="storefront-logo">
              <LocalMallIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" className="storefront-brand">
                SmartBiz Storefront
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {session.customerName}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Inventory2Icon />}
              onClick={() => navigate(`/storefront/${customerToken}`)}
              size="small"
            >
              สินค้า
            </Button>
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/storefront/${customerToken}/orders`)}
              size="small"
            >
              ประวัติ
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}

function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: StorefrontProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const isOut = product.status === stockStatus_e.stockOut || product.amount <= 0;

  return (
    <Paper className="product-card" variant="outlined">
      <Box className="product-image-wrap">
        <img src={product.img} alt={product.name} className="product-image" />
        <Chip
          label={stockLabel(product)}
          color={isOut ? "error" : product.status === stockStatus_e.stockLow ? "warning" : "success"}
          size="small"
          className="product-stock"
        />
      </Box>
      <Box className="product-body">
        <Typography variant="subtitle1" className="product-title">
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {product.id}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="product-description">
          {product.description}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="baseline" className="product-price-row">
          {product.percentDiscount > 0 && (
            <Typography variant="body2" color="text.secondary" className="price-original">
              {formatMoney(product.price)}
            </Typography>
          )}
          <Typography variant="h6" color="primary.dark">
            {formatMoney(product.priceAfterDiscount)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={product.percentDiscount > 0 ? `ลด ${product.percentDiscount}%` : "ราคาปกติ"}
            size="small"
            color={product.percentDiscount > 0 ? "error" : "default"}
            variant={product.percentDiscount > 0 ? "filled" : "outlined"}
          />
          <Typography variant="caption" color="text.secondary">
            หลังหักส่วนลด
          </Typography>
        </Stack>
      </Box>
      <Box className="product-actions">
        <IconButton aria-label={`ลดจำนวน ${product.name}`} onClick={onRemove} disabled={quantity === 0}>
          <RemoveIcon />
        </IconButton>
        <Typography className="quantity-value">{quantity}</Typography>
        <IconButton
          aria-label={`เพิ่ม ${product.name}`}
          color="primary"
          onClick={onAdd}
          disabled={isOut || quantity >= product.amount}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

function CartSummary({
  products,
  cart,
  onConfirm,
  onRemove,
  isSubmitting,
}: {
  products: StorefrontProduct[];
  cart: CartItem[];
  onConfirm: () => void;
  onRemove: (productID: string) => void;
  isSubmitting: boolean;
}) {
  const cartRows = cart
    .map((item) => {
      const product = products.find((value) => value.id === item.productID);
      if (!product) return undefined;
      return {
        ...item,
        product,
        total: product.priceAfterDiscount * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const totalAmount = cartRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <Box className="cart-summary">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">สรุปคำสั่งซื้อ</Typography>
        <Badge badgeContent={cartRows.length} color="primary">
          <ShoppingCartIcon />
        </Badge>
      </Stack>
      <Divider />
      {cartRows.length === 0 ? (
        <Typography color="text.secondary" className="empty-cart">
          ยังไม่มีสินค้าในคำสั่งซื้อ
        </Typography>
      ) : (
        <List disablePadding>
          {cartRows.map((row) => (
            <ListItem key={row.productID} disableGutters className="cart-row">
              <ListItemText
                primary={row.product.name}
                secondary={`${row.quantity} x ${formatMoney(row.product.priceAfterDiscount)}`}
              />
              <Stack alignItems="flex-end" spacing={0.5}>
                <Typography fontWeight={600}>{formatMoney(row.total)}</Typography>
                <Button size="small" color="inherit" onClick={() => onRemove(row.productID)}>
                  ลบ
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      )}
      <Divider />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography color="text.secondary">ยอดรวมที่ต้องชำระ</Typography>
        <Typography variant="h5" color="primary.dark">
          {formatMoney(totalAmount)}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        size="large"
        startIcon={<CheckCircleIcon />}
        disabled={cartRows.length === 0 || isSubmitting}
        onClick={onConfirm}
      >
        {isSubmitting ? "กำลังยืนยัน" : "ยืนยันคำสั่งซื้อ"}
      </Button>
    </Box>
  );
}

function ProductPage() {
  const { customerToken, session } = useStorefrontSession();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [query, setQuery] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdOrder, setCreatedOrder] = React.useState<StorefrontOrder>();

  const products = mockProducts;
  const filteredProducts = React.useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(text) || product.id.toLowerCase().includes(text),
    );
  }, [products, query]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: StorefrontProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.productID === product.id);
      if (!existing) return [...current, { productID: product.id, quantity: 1 }];
      return current.map((item) =>
        item.productID === product.id
          ? { ...item, quantity: Math.min(product.amount, item.quantity + 1) }
          : item,
      );
    });
  }

  function removeOne(productID: string) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.productID !== productID) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  function removeLine(productID: string) {
    setCart((current) => current.filter((item) => item.productID !== productID));
  }

  function confirmOrder() {
    if (!session || cart.length === 0) return;
    setIsSubmitting(true);

    window.setTimeout(() => {
      const orderItems = cart.flatMap((item) => {
        const product = products.find((value) => value.id === item.productID);
        if (!product) return [];
        return [
          {
            productID: product.id,
            name: product.name,
            quantity: item.quantity,
            priceOriginal: product.price,
            discountPercent: product.percentDiscount,
            priceAfterDiscount: product.priceAfterDiscount,
            img: product.img,
          },
        ];
      });
      const nextOrder: StorefrontOrder = {
        id: `SO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`,
        customerID: session.customerID,
        date: new Date().toISOString(),
        status: billStatus_e.PrepareProduct,
        totalAmount: orderItems.reduce((sum, item) => sum + item.priceAfterDiscount * item.quantity, 0),
        items: orderItems,
      };
      const nextOrders = [nextOrder, ...getStoredOrders(customerToken)];
      saveStoredOrders(customerToken, nextOrders);
      setCreatedOrder(nextOrder);
      setCart([]);
      setIsSubmitting(false);
      setIsDrawerOpen(false);
    }, 450);
  }

  const cartPanel = (
    <CartSummary
      products={products}
      cart={cart}
      onConfirm={confirmOrder}
      onRemove={removeLine}
      isSubmitting={isSubmitting}
    />
  );

  return (
    <StorefrontLayout>
      <Container maxWidth="xl" className="storefront-content">
        <Box className="storefront-grid">
          <Box className="product-section">
            <Stack spacing={2.25}>
              <Box className="page-heading">
                <Box>
                  <Typography variant="h4">รายการสินค้า</Typography>
                  <Typography color="text.secondary">
                    เลือกสินค้า ตรวจสอบส่วนลด และยืนยันคำสั่งซื้อจากลิงก์ลูกค้า
                  </Typography>
                </Box>
                {isMobile && (
                  <IconButton
                    color="primary"
                    aria-label="เปิดสรุปคำสั่งซื้อ"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Badge badgeContent={cartCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                )}
              </Box>

              {createdOrder && (
                <Alert
                  severity="success"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate(`/storefront/${customerToken}/orders/${createdOrder.id}`)}
                    >
                      ดูสถานะ
                    </Button>
                  }
                >
                  ยืนยันคำสั่งซื้อ {createdOrder.id} สำเร็จ
                </Alert>
              )}

              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า"
                fullWidth
                className="storefront-search"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cart.find((item) => item.productID === product.id)?.quantity ?? 0}
                    onAdd={() => addToCart(product)}
                    onRemove={() => removeOne(product.id)}
                  />
                ))}
              </Box>

              {filteredProducts.length === 0 && (
                <Paper variant="outlined" className="empty-state">
                  <Typography color="text.secondary">ไม่พบสินค้าที่ตรงกับคำค้นหา</Typography>
                </Paper>
              )}
            </Stack>
          </Box>

          {!isMobile && <Box className="summary-section">{cartPanel}</Box>}
        </Box>
      </Container>
      <Drawer anchor="bottom" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box className="mobile-cart">{cartPanel}</Box>
      </Drawer>
    </StorefrontLayout>
  );
}

function OrderHistoryPage() {
  const { customerToken } = useStorefrontSession();
  const navigate = useNavigate();
  const orders = getStoredOrders(customerToken);

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" className="storefront-content">
        <Box className="page-heading">
          <Box>
            <Typography variant="h4">ประวัติคำสั่งซื้อ</Typography>
            <Typography color="text.secondary">ดูรายการย้อนหลังและสถานะล่าสุดของคำสั่งซื้อ</Typography>
          </Box>
        </Box>
        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Paper
              key={order.id}
              variant="outlined"
              className="order-row"
              onClick={() => navigate(`/storefront/${customerToken}/orders/${order.id}`)}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">{order.id}</Typography>
                <Typography color="text.secondary">
                  {new Date(order.date).toLocaleString("th-TH")} | {order.items.length} รายการ
                </Typography>
              </Stack>
              <Stack alignItems="flex-end" spacing={1}>
                <Chip label={statusLabel(order.status)} color={statusColor(order.status)} size="small" />
                <Typography variant="h6" color="primary.dark">
                  {formatMoney(order.totalAmount)}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </StorefrontLayout>
  );
}

function OrderDetailPage() {
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

function StorefrontApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/storefront/demo-customer" replace />} />
          <Route path="/storefront/:customerToken" element={<ProductPage />} />
          <Route path="/storefront/:customerToken/orders" element={<OrderHistoryPage />} />
          <Route path="/storefront/:customerToken/orders/:orderID" element={<OrderDetailPage />} />
          <Route path="*" element={<Navigate to="/storefront/demo-customer" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("storefront-root")!).render(<StorefrontApp />);
