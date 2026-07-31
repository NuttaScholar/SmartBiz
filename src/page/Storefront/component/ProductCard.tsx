import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { stockStatus_e } from '../../../enum';
import type { StorefrontProduct } from '../type';
import { formatMoney, stockLabel } from '../lib/format';

export function ProductCard({
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
        <Box className="product-heading">
          <Typography variant="h5" className="product-title">
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.id}
          </Typography>
        </Box>
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
