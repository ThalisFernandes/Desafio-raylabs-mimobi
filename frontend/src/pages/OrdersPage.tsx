import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/api';
import OrderCard from '../components/Orders/OrderCard';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // buscar pedidos
  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await orderService.getAll();
      setOrders(response.data);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos. Verifique se o backend está rodando.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // buscar pedidos na inicializacao
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // auto refresh a cada 10 segundos se habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders(false); // nao mostrar loading no auto refresh
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  // aplicar filtros
  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // ordenar por data de criacao (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as OrderStatus | '');
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Você ainda não fez nenhum pedido
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Que tal dar uma olhada nos nossos produtos?
        </Typography>
        <Button
          variant="contained"
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
        Meus Pedidos
      </Typography>

      {/* controles e filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">Todos os Status</MenuItem>
                <MenuItem value="PENDING_PAYMENT">
                  Aguardando Pagamento ({getStatusCount('PENDING_PAYMENT')})
                </MenuItem>
                <MenuItem value="CONFIRMED">
                  Confirmados ({getStatusCount('CONFIRMED')})
                </MenuItem>
                <MenuItem value="CANCELLED">
                  Cancelados ({getStatusCount('CANCELLED')})
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Atualização automática"
            />
            
            <Typography variant="body2" color="text.secondary">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Typography>
          </Box>
        </Box>

        {/* resumo dos status */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Total: ${orders.length}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Aguardando: ${getStatusCount('PENDING_PAYMENT')}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`Confirmados: ${getStatusCount('CONFIRMED')}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Cancelados: ${getStatusCount('CANCELLED')}`}
            color="error"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* lista de pedidos */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {filteredOrders.length} pedido(s) encontrado(s)
          {statusFilter && ` com status "${statusFilter}"`}
        </Typography>
      </Box>

      {filteredOrders.length === 0 ? (
        <Alert severity="info">
          Nenhum pedido encontrado com os filtros aplicados.
        </Alert>
      ) : (
        <Box>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}

      {/* indicador de loading para auto refresh */}
      {loading && orders.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Atualizando...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;