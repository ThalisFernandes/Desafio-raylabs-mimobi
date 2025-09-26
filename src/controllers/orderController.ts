import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { validateData } from '../utils/validation';
import { orderSchema, paginationSchema } from '../utils/validation';
import { OrderStatus } from '../types';
import { logInfo } from '../config/logger';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // criar pedido
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validateData(orderSchema, req.body);
      
      const order = await this.orderService.createOrder(validatedData);
      
      logInfo('Pedido criado via API', { orderId: order.id });
      
      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar pedido por id
  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const order = await this.orderService.getOrderById(id);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  // listar todos os pedidos
  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = validateData(paginationSchema, req.query);
      
      const result = await this.orderService.getAllOrders(
        Number(page), 
        Number(limit)
      );
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar pedidos por cliente
  getOrdersByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10 } = validateData(paginationSchema, req.query);
      
      const result = await this.orderService.getOrdersByCustomer(
        customerId,
        Number(page), 
        Number(limit)
      );
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar pedidos por status
  getOrdersByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;
      const { page = 1, limit = 10 } = validateData(paginationSchema, req.query);
      
      // valida se o status e valido
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Status invalido'
        });
      }
      
      const result = await this.orderService.getOrdersByStatus(
        status as OrderStatus,
        Number(page), 
        Number(limit)
      );
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // atualizar status do pedido
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // valida se o status e valido
      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status invalido'
        });
      }
      
      const order = await this.orderService.updateOrderStatus(id, status);
      
      logInfo('Status do pedido atualizado via API', { orderId: id, newStatus: status });
      
      res.json({
        success: true,
        message: 'Status do pedido atualizado com sucesso',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };
}