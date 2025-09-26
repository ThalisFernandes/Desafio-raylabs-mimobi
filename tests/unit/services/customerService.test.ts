import { CustomerService } from '../../../src/services/customerService';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../../src/utils/errors';

// mock do prisma
jest.mock('@prisma/client');
const mockPrisma = {
  customer: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('CustomerService', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    customerService = new CustomerService();
    (customerService as any).prisma = mockPrisma;
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    const customerData = {
      name: 'João Silva',
      email: 'joao@email.com',
      document: '12345678901',
      phone: '11999999999',
      address: 'Rua A, 123'
    };

    it('deve criar um cliente com sucesso', async () => {
      // arrange
      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({
        id: '1',
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // act
      const result = await customerService.createCustomer(customerData);

      // assert
      expect(result).toHaveProperty('id', '1');
      expect(result.name).toBe(customerData.name);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: customerData
      });
    });

    it('deve lancar erro se email ja existir', async () => {
      // arrange
      mockPrisma.customer.findUnique.mockResolvedValueOnce({
        id: '1',
        email: customerData.email
      });

      // act & assert
      await expect(customerService.createCustomer(customerData))
        .rejects.toThrow(ConflictError);
      
      expect(mockPrisma.customer.create).not.toHaveBeenCalled();
    });

    it('deve lancar erro se documento ja existir', async () => {
      // arrange
      mockPrisma.customer.findUnique
        .mockResolvedValueOnce(null) // email nao existe
        .mockResolvedValueOnce({ id: '1', document: customerData.document }); // documento existe

      // act & assert
      await expect(customerService.createCustomer(customerData))
        .rejects.toThrow(ConflictError);
      
      expect(mockPrisma.customer.create).not.toHaveBeenCalled();
    });
  });

  describe('getCustomerById', () => {
    it('deve retornar cliente por id', async () => {
      // arrange
      const customer = {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com'
      };
      mockPrisma.customer.findUnique.mockResolvedValue(customer);

      // act
      const result = await customerService.getCustomerById('1');

      // assert
      expect(result).toEqual(customer);
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('deve lancar erro se cliente nao existir', async () => {
      // arrange
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // act & assert
      await expect(customerService.getCustomerById('999'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllCustomers', () => {
    it('deve retornar lista paginada de clientes', async () => {
      // arrange
      const customers = [
        { id: '1', name: 'João' },
        { id: '2', name: 'Maria' }
      ];
      mockPrisma.customer.findMany.mockResolvedValue(customers);
      mockPrisma.customer.count.mockResolvedValue(2);

      // act
      const result = await customerService.getAllCustomers(1, 10);

      // assert
      expect(result.data).toEqual(customers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findCustomerByEmail', () => {
    it('deve encontrar cliente por email', async () => {
      // arrange
      const customer = { id: '1', email: 'joao@email.com' };
      mockPrisma.customer.findUnique.mockResolvedValue(customer);

      // act
      const result = await customerService.findCustomerByEmail('joao@email.com');

      // assert
      expect(result).toEqual(customer);
    });

    it('deve retornar null se cliente nao existir', async () => {
      // arrange
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // act
      const result = await customerService.findCustomerByEmail('inexistente@email.com');

      // assert
      expect(result).toBeNull();
    });
  });
});