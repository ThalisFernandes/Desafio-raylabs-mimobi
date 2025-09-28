import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Box,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <StoreIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          E-commerce Mimobi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/')}
            variant={isActive('/') ? 'outlined' : 'text'}
            sx={{
              borderColor: isActive('/') ? 'white' : 'transparent',
              '&:hover': {
                borderColor: 'white',
              },
            }}
          >
            Produtos
          </Button>
          
          <Button
            color="inherit"
            onClick={() => handleNavigation('/orders')}
            variant={isActive('/orders') ? 'outlined' : 'text'}
            sx={{
              borderColor: isActive('/orders') ? 'white' : 'transparent',
              '&:hover': {
                borderColor: 'white',
              },
            }}
          >
            Meus Pedidos
          </Button>
          
          <IconButton
            color="inherit"
            onClick={() => handleNavigation('/cart')}
            sx={{
              border: isActive('/cart') ? '1px solid white' : 'none',
              borderRadius: 1,
            }}
          >
            <Badge badgeContent={getItemCount()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;