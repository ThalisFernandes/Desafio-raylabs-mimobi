import { Router } from 'express';
import { customerRoutes } from './customerRoutes';
import { productRoutes } from './productRoutes';
import { orderRoutes } from './orderRoutes';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// rota de health check (sem autenticacao)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// aplica middleware de autenticacao para todas as rotas protegidas
router.use('/customers', authenticateApiKey, customerRoutes);
router.use('/products', authenticateApiKey, productRoutes);
router.use('/orders', authenticateApiKey, orderRoutes);

export { router as apiRoutes };