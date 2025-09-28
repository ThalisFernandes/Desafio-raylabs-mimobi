import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const totalPrice = item.product.price * item.quantity;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* info do produto */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {item.product.name}
          </Typography>
          
          {item.product.description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.product.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="primary" fontWeight="bold">
              {formatPrice(item.product.price)} cada
            </Typography>
            
            {item.product.category && (
              <Chip 
                label={item.product.category} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Chip
            label={`Estoque disponível: ${item.product.stock}`}
            size="small"
            color={item.product.stock > 10 ? 'success' : 'warning'}
          />
        </Box>

        {/* controles de quantidade */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            size="small"
          >
            <RemoveIcon />
          </IconButton>
          
          <TextField
            value={item.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              handleQuantityChange(value);
            }}
            size="small"
            sx={{ 
              width: 80,
              '& input': { textAlign: 'center' }
            }}
            inputProps={{
              min: 1,
              max: item.product.stock,
              type: 'number'
            }}
          />
          
          <IconButton
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* preco total e remover */}
        <Box sx={{ textAlign: 'right', minWidth: 120 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatPrice(totalPrice)}
          </Typography>
          
          <IconButton
            onClick={() => removeFromCart(item.product.id)}
            color="error"
            size="small"
            sx={{ mt: 1 }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default CartItem;