import { Router } from 'express';
import { customerRoutes } from './customerRoutes';
import { productRoutes } from './productRoutes';
import { orderRoutes } from './orderRoutes';

const router = Router();

// registra todas as rotas da api
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

export { router as apiRoutes };