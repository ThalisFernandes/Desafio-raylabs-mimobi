import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { Order, OrderStatus } from '../../types';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          label: 'Aguardando Pagamento',
          color: 'warning' as const,
          icon: <ScheduleIcon />,
          description: 'Seu pedido está sendo processado. O pagamento será confirmado em breve.',
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmado',
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          description: 'Pagamento aprovado! Seu pedido foi confirmado e está sendo preparado.',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          color: 'error' as const,
          icon: <CancelIcon />,
          description: 'Pedido cancelado. O pagamento não foi aprovado ou houve problema com o estoque.',
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <PaymentIcon />,
          description: 'Status do pedido',
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const totalAmount = order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || order.totalAmount;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* cabecalho do pedido */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Pedido #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Criado em: {formatDate(order.createdAt)}
            </Typography>
            {order.updatedAt !== order.createdAt && (
              <Typography variant="body2" color="text.secondary">
                Atualizado em: {formatDate(order.updatedAt)}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              icon={statusConfig.icon}
              sx={{ mb: 1 }}
            />
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatPrice(totalAmount)}
            </Typography>
          </Box>
        </Box>

        {/* descricao do status */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {statusConfig.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* detalhes do pedido */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              Detalhes do Pedido ({order.orderItems?.length || 0} {(order.orderItems?.length || 0) === 1 ? 'item' : 'itens'})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {order.orderItems?.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {item.product?.name || `Produto ID: ${item.productId}`}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Quantidade: {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(item.price)} cada
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Total do Pedido:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(totalAmount)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* info do cliente */}
        {order.customer && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Dados do Cliente:
            </Typography>
            <Typography variant="body2">
              <strong>Nome:</strong> {order.customer.name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {order.customer.email}
            </Typography>
            {order.customer.phone && (
              <Typography variant="body2">
                <strong>Telefone:</strong> {order.customer.phone}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;