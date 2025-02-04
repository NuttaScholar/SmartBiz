import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  status: string;
  stock: number;
  unit: string;
  isMine: boolean;
}

interface OptionsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isActive: boolean;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  anchorEl,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  isActive
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
  >
    <MenuItem onClick={onEdit}>แก้ไข</MenuItem>
    <MenuItem onClick={onToggleStatus} sx={{ color: 'primary.main' }}>
      {isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
    </MenuItem>
    <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
      ลบ
    </MenuItem>
  </Menu>
);

const ProductListItem: React.FC<{
  product: Product;
  onOptionClick: (action: string, id: string) => void;
}> = ({ product, onOptionClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isActive = product.status === "เปิดใช้งาน";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    onOptionClick(action, product.id);
    handleMenuClose();
  };

  return (
    <Card sx={{ mb: 2, bgcolor: 'primary.50', position: 'relative' }}>
      {product.isMine && (
        <Chip
          label="My"
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 16,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }}
        />
      )}
      <CardContent>
        <Box display="flex" alignItems="flex-start">
          <Avatar
            variant="rounded"
            src="/api/placeholder/48/48"
            alt={product.name}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" component="h3">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  รหัส: {product.code}
                  <Box component="span" ml={2}>ราคา: {product.price}</Box>
                </Typography>
                <Typography variant="body2">
                  <Box component="span" color={isActive ? 'success.main' : 'error.main'}>
                    สถานะ: {product.status}
                  </Box>
                  <Box component="span" ml={2} color="text.secondary">
                    สต็อก: {product.stock}
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  หน่วย: {product.unit}
                </Typography>
              </Box>
              
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <OptionsMenu
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                onEdit={() => handleAction('edit')}
                onDelete={() => handleAction('delete')}
                onToggleStatus={() => handleAction('toggleStatus')}
                isActive={isActive}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const mockProducts: Product[] = [
  {
    id: "1",
    name: "ถังน้ำ",
    code: "P001",
    price: 299,
    status: "เปิดใช้งาน",
    stock: 150,
    unit: "ถัง",
    isMine: true
  }
];

const mockAPI = {
  getProducts: (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockProducts]);
      }, 800);
    });
  },

  deleteProduct: (productId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
          mockProducts.splice(index, 1);
        }
        resolve({ success: true });
      }, 500);
    });
  },

  toggleProductStatus: (productId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
          product.status = product.status === "เปิดใช้งาน" ? "ปิดใช้งาน" : "เปิดใช้งาน";
        }
        resolve({ success: true });
      }, 500);
    });
  }
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await mockAPI.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (action: string, productId: string) => {
    try {
      switch (action) {
        case 'edit':
          alert(`แก้ไขสินค้า ID: ${productId}`);
          break;

        case 'delete':
          if (window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
            await mockAPI.deleteProduct(productId);
            await fetchProducts();
          }
          break;

        case 'toggleStatus':
          await mockAPI.toggleProductStatus(productId);
          await fetchProducts();
          break;

        default:
          break;
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchProducts}>
              ลองใหม่
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" p={4}>
      <Typography variant="h5" component="h1" gutterBottom>
        รายการสินค้า ({products.length})
      </Typography>
      <Stack spacing={2}>
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            onOptionClick={handleOptionClick}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProductList;