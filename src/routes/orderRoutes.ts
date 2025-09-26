import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();
const orderController = new OrderController();

// rotas para pedidos
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.get('/customer/:customerId', orderController.getOrdersByCustomer);
router.get('/status/:status', orderController.getOrdersByStatus);

export { router as orderRoutes };