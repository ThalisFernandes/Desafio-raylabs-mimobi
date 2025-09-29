import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { customerService, orderService } from '../services/api';
import { CreateCustomerData, CreateOrderData } from '../types';
import CartItem from '../components/Cart/CartItem';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart, getTotalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // dados do cliente para checkout
  const [customerData, setCustomerData] = useState<CreateCustomerData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleInputChange = (field: keyof CreateCustomerData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCustomerData = () => {
    if (!customerData.name.trim()) return 'Nome é obrigatório';
    if (!customerData.email.trim()) return 'Email é obrigatório';
    if (!customerData.email.includes('@')) return 'Email inválido';
    if (!customerData.phone?.trim()) return 'Telefone é obrigatório';
    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateCustomerData();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (state.items.length === 0) {
      setError('Carrinho está vazio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let customerId: string;

      // primeiro tenta buscar cliente existente por email
      try {
        const existingCustomer = await customerService.getByEmail(customerData.email);
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // se nao encontrou por email, tenta criar novo cliente
          const customerResponse = await customerService.create(customerData);
          
          if (!customerResponse.data) {
            throw new Error('Erro ao criar cliente: dados não retornados');
          }
          
          customerId = customerResponse.data.id;
        }
      } catch (createError: any) {
        // se falhou ao criar, pode ser porque ja existe - tenta buscar novamente
        if (createError.response?.status === 409) {
          const existingCustomer = await customerService.getByEmail(customerData.email);
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }

      // preparar dados do pedido
      const orderData: CreateOrderData = {
        customerId,
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      // criar pedido
      const orderResponse = await orderService.create(orderData);
      
      setOrderId(orderResponse.id);
      setSuccess(true);
      clearCart();
      
      // fechar dialog de checkout apos sucesso
      setTimeout(() => {
        setShowCheckout(false);
        navigate('/orders');
      }, 3000);

    } catch (err: any) {
      console.error('Erro no checkout:', err);
      setError(
        err.response?.data?.message || 
        'Erro ao processar pedido. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Seu carrinho está vazio
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Adicione alguns produtos para continuar
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Ver Produtos
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Carrinho de Compras
      </Typography>

      <Grid container spacing={3}>
        {/* itens do carrinho */}
        <Grid item xs={12} md={8}>
          <Box>
            {state.items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </Box>
        </Grid>

        {/* resumo do pedido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Resumo do Pedido
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {state.items.map((item) => (
                <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.product.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(item.product.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(getTotalPrice())}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PaymentIcon />}
              onClick={() => setShowCheckout(true)}
              sx={{ py: 1.5 }}
            >
              Finalizar Compra
            </Button>
            
            <Button
              variant="text"
              fullWidth
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 1 }}
            >
              Continuar Comprando
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* dialog de checkout */}
      <Dialog 
        open={showCheckout} 
        onClose={() => !loading && setShowCheckout(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {success ? 'Pedido Realizado!' : 'Finalizar Compra'}
        </DialogTitle>
        
        <DialogContent>
          {success ? (
            <Box textAlign="center" py={2}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Pedido #{orderId} criado com sucesso!
              </Alert>
              <Typography variant="body1" paragraph>
                Você será redirecionado para a página de pedidos em alguns segundos.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                O status do seu pedido será atualizado automaticamente conforme o processamento.
              </Typography>
            </Box>
          ) : (
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="body1" gutterBottom>
                Preencha seus dados para finalizar a compra:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome completo"
                    fullWidth
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Telefone"
                    fullWidth
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="CPF/CNPJ"
                    fullWidth
                    value={customerData.document}
                    onChange={(e) => handleInputChange('document', e.target.value)}
                    disabled={loading}
                    required
                    placeholder="Digite apenas números (11 dígitos para CPF ou 14 para CNPJ)"
                    helperText="Apenas números, sem pontos ou traços"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Endereço"
                    fullWidth
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={loading}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resumo do Pedido:
                </Typography>
                <Typography variant="h6" color="primary">
                  Total: {formatPrice(getTotalPrice())}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        {!success && (
          <DialogActions>
            <Button 
              onClick={() => setShowCheckout(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
            >
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default CartPage;

export {};