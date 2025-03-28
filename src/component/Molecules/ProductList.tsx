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
  Avatar,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from "axios";
import Search_Field from './Search_Field';
import Filter_Field from './Filter_Field';

export interface Product {
  _id: string;
  name: string;
  code: string;
  price: number;
  status: number;
  stock: number;
  unit: string;
  isMine: boolean;
  img: string;
}

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => void;
  onEditProduct: (productId: string) => void;
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
  const isActive = product.status;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    onOptionClick(action, product._id);
    handleMenuClose();
  };

  return (
    <Card sx={{ mb: 2, bgcolor: '#E0EFFF', position: 'relative', maxWidth: '520px', minWidth: '350px' }}>
      {product.isMine ? (
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
      ):(
        <></>
      )}
      <CardContent>
        <Box display="flex" alignItems="flex-start">
          <Avatar
            variant="rounded"
            src={product.img}
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
                    สถานะ: {product.status ? "เปิดใช้งาน" : "ปิดใข้งาน"}
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
                onEdit={() => handleAction('edit' )}
                onDelete={() => handleAction('delete')}
                onToggleStatus={() => handleAction('toggleStatus')}
                isActive={Boolean(isActive)}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// const mockProducts: Product[] = [
//   {
//     id: "1",
//     name: "ถังน้ำ",
//     code: "P001",
//     price: 299,
//     status: "เปิดใช้งาน",
//     stock: 150,
//     unit: "ถัง",
//     isMine: true
//   },
//   {
//     id: "1",
//     name: "ถังน้ำ",
//     code: "P001",
//     price: 299,
//     status: "เปิดใช้งาน",
//     stock: 150,
//     unit: "ถัง",
//     isMine: true
//   }
// ];

// const mockAPI = {
//   getProducts: (): Promise<Product[]> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve([...mockProducts]);
//       }, 800);
//     });
//   },

//   deleteProduct: (productId: string): Promise<{ success: boolean }> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const index = mockProducts.findIndex(p => p.id === productId);
//         if (index !== -1) {
//           mockProducts.splice(index, 1);
//         }
//         resolve({ success: true });
//       }, 500);
//     });
//   },

//   toggleProductStatus: (productId: string): Promise<{ success: boolean }> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const product = mockProducts.find(p => p.id === productId);
//         if (product) {
//           product.status = product.status === "เปิดใช้งาน" ? "ปิดใช้งาน" : "เปิดใช้งาน";
//         }
//         resolve({ success: true });
//       }, 500);
//     });
//   }
// };

const ProductList: React.FC<ProductListProps> = ({ products, loading, error, fetchProducts, onEditProduct }) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [isMineFilter, setIsMineFilter] = useState<string>("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState<string>("ทั้งหมด");

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOptionClick = async (action: string, productId: string) => {
    console.log(action, productId)
    try {
      switch (action) {
        case 'edit':
          onEditProduct(productId);
          break;

        case 'delete':
          if (window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
            await axios.delete(`http://localhost:3001/product/deleteProduct/${productId}`);
            fetchProducts();
          }
          break;

        case 'toggleStatus':
          await axios.put(`http://localhost:3001/product/toggleStatus/${productId}`);
          fetchProducts();
          break;

        default:
          break;
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

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

  const isMineArray = Array.from(new Set(products.map((product) => product.isMine)));
  const statusArray = Array.from(new Set(products.map((product) => product.status)));

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (isMine: string, status: string) => {
    setIsMineFilter(isMine);
    setStatusFilter(status);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm === "" || 
      product.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIsMine = isMineFilter === "ทั้งหมด" || 
      (isMineFilter === "เจ้าของ" && product.isMine) || 
      (isMineFilter === "ไม่ใช่เจ้าของ" && !product.isMine);

    const matchesStatus = statusFilter === "ทั้งหมด" || 
      (statusFilter === "เปิดใช้งาน" && product.status) || 
      (statusFilter === "ปิดใช้งาน" && !product.status);

    return matchesSearch && matchesIsMine && matchesStatus;
  });

  return (
    <Box width={'100%'} mx="auto" >
      <Stack margin="20px" gap="8px">
        <Search_Field onSearchChange={handleSearchChange}/>
        <Filter_Field
          isMine={isMineArray}
          status={statusArray}
          selectedIsMine={isMineFilter}
          selectedStatus={statusFilter}
          onFilterChange={handleFilterChange}
        />
      </Stack>

      <Divider sx={{ margin: "8px 0px" }}/>
      {/* <Typography variant="h5" component="h1" gutterBottom>
        รายการสินค้า ({filteredProducts.length})
      </Typography> */}
      <Stack 
        width={'100%'}
        flexDirection={'row'}
        flexWrap={'wrap'}
        justifyContent={'center'}
        gap={2}
      >
        {filteredProducts.map((product) => (
          <ProductListItem
            key={product._id}
            product={product}
            onOptionClick={handleOptionClick}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ProductList;