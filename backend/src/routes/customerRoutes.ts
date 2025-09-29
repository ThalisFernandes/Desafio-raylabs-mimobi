import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';

const router = Router();
const customerController = new CustomerController();

// rotas para clientes
router.post('/', customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.get('/email/:email', customerController.getCustomerByEmail);
router.get('/document/:document', customerController.getCustomerByDocument);

export { router as customerRoutes };