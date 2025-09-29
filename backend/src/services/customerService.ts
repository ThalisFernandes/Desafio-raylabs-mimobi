import { prisma } from '../config/database';
import { CreateCustomerDTO, Customer } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logInfo, logError } from '../config/logger';

export class CustomerService {
  // criar novo cliente
  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    try {
      // verifica se email ja existe
      const existingEmail = await prisma.customer.findUnique({
        where: { email: data.email }
      });

      if (existingEmail) {
        throw new ConflictError('Email ja cadastrado no sistema');
      }

      // verifica se documento ja existe
      const existingDocument = await prisma.customer.findUnique({
        where: { document: data.document }
      });

      if (existingDocument) {
        throw new ConflictError('Documento ja cadastrado no sistema');
      }

      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          document: data.document,
        }
      });

      logInfo('Cliente criado com sucesso', { customerId: customer.id });
      return customer;
    } catch (error) {
      logError('Erro ao criar cliente', error);
      throw error;
    }
  }

  // buscar cliente por id
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id }
      });

      if (!customer) {
        throw new NotFoundError('Cliente');
      }

      return customer;
    } catch (error) {
      logError('Erro ao buscar cliente', error);
      throw error;
    }
  }

  // listar todos os clientes com paginacao
  async getAllCustomers(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logError('Erro ao listar clientes', error);
      throw error;
    }
  }

  // buscar cliente por email
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      return await prisma.customer.findUnique({
        where: { email }
      });
    } catch (error) {
      logError('Erro ao buscar cliente por email', error);
      throw error;
    }
  }

  // buscar cliente por documento
  async getCustomerByDocument(document: string): Promise<Customer | null> {
    try {
      return await prisma.customer.findUnique({
        where: { document }
      });
    } catch (error) {
      logError('Erro ao buscar cliente por documento', error);
      throw error;
    }
  }
}