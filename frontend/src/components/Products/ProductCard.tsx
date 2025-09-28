import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock) {
      addToCart(product, quantity);
      setShowSuccess(true);
      setQuantity(1); // resetar quantidade apos adicionar
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const isOutOfStock = product.stock === 0;
  const isQuantityValid = quantity > 0 && quantity <= product.stock;

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          opacity: isOutOfStock ? 0.6 : 1,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {product.name}
          </Typography>
          
          {product.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {product.description}
            </Typography>
          )}
          
          {product.category && (
            <Chip 
              label={product.category} 
              size="small" 
              sx={{ mb: 2 }}
              color="primary"
              variant="outlined"
            />
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatPrice(product.price)}
            </Typography>
            
            <Chip
              label={`Estoque: ${product.stock}`}
              color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          {!isOutOfStock ? (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value >= 1 && value <= product.stock) {
                      setQuantity(value);
                    }
                  }}
                  size="small"
                  sx={{ 
                    width: 80, 
                    mx: 1,
                    '& input': { textAlign: 'center' }
                  }}
                  inputProps={{
                    min: 1,
                    max: product.stock,
                    type: 'number'
                  }}
                />
                
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!isQuantityValid}
                sx={{ py: 1 }}
              >
                Adicionar ao Carrinho
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              disabled
              sx={{ py: 1 }}
            >
              Produto Indisponível
            </Button>
          )}
        </CardActions>
      </Card>
      
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Produto adicionado ao carrinho!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;