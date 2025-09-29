import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';
import { validateData } from '../utils/validation';
import { createCustomerSchema, paginationSchema } from '../utils/validation';
import { logInfo } from '../config/logger';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  // criar cliente
  createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validateData(createCustomerSchema, req.body);
      
      const customer = await this.customerService.createCustomer(validatedData);
      
      logInfo('Cliente criado via API', { customerId: customer.id });
      
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar cliente por id
  getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const customer = await this.customerService.getCustomerById(id);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  // listar todos os clientes
  getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = validateData(paginationSchema, req.query);
      
      const result = await this.customerService.getAllCustomers(
        Number(page), 
        Number(limit)
      );
      
      res.json({
        success: true,
        data: result.customers,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar cliente por email
  getCustomerByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      
      const customer = await this.customerService.getCustomerByEmail(email);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente nao encontrado'
        });
      }
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar cliente por documento
  getCustomerByDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { document } = req.params;
      
      const customer = await this.customerService.getCustomerByDocument(document);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente nao encontrado'
        });
      }
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };
}