import { OrderService } from '../../../src/services/orderService';
import { CustomerService } from '../../../src/services/customerService';
import { ProductService } from '../../../src/services/productService';
import { MessagingService } from '../../../src/services/messagingService';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';

// mocks
jest.mock('@prisma/client');
jest.mock('../../../src/services/customerService');
jest.mock('../../../src/services/productService');
jest.mock('../../../src/services/messagingService');

const mockPrisma = {
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
} as any;

const mockCustomerService = {
  getCustomerById: jest.fn(),
} as jest.Mocked<CustomerService>;

const mockProductService = {
  getProductById: jest.fn(),
  checkStock: jest.fn(),
} as jest.Mocked<ProductService>;

const mockMessagingService = {
  publishOrderCreated: jest.fn(),
} as jest.Mocked<MessagingService>;

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(
      mockCustomerService,
      mockProductService,
      mockMessagingService
    );
    (orderService as any).prisma = mockPrisma;
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const orderData = {
      customerId: '1',
      items: [
        { productId: '1', quantity: 2, price: 50.00 },
        { productId: '2', quantity: 1, price: 30.00 }
      ]
    };

    it('deve criar pedido com sucesso', async () => {
      // arrange
      mockCustomerService.getCustomerById.mockResolvedValue({
        id: '1',
        name: 'João Silva'
      } as any);

      mockProductService.getProductById
        .mockResolvedValueOnce({ id: '1', name: 'Produto 1', price: 50.00 } as any)
        .mockResolvedValueOnce({ id: '2', name: 'Produto 2', price: 30.00 } as any);

      mockProductService.checkStock
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const createdOrder = {
        id: '1',
        customerId: '1',
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount: 130.00,
        items: orderData.items,
        createdAt: new Date()
      };

      mockPrisma.order.create.mockResolvedValue(createdOrder);

      // act
      const result = await orderService.createOrder(orderData);

      // assert
      expect(result).toEqual(createdOrder);
      expect(mockCustomerService.getCustomerById).toHaveBeenCalledWith('1');
      expect(mockProductService.checkStock).toHaveBeenCalledTimes(2);
      expect(mockMessagingService.publishOrderCreated).toHaveBeenCalledWith({
        orderId: '1',
        customerId: '1',
        totalAmount: 130.00,
        items: orderData.items,
        createdAt: expect.any(Date)
      });
    });

    it('deve lancar erro se cliente nao existir', async () => {
      // arrange
      mockCustomerService.getCustomerById.mockRejectedValue(
        new NotFoundError('Cliente não encontrado')
      );

      // act & assert
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow(NotFoundError);
      
      expect(mockPrisma.order.create).not.toHaveBeenCalled();
    });

    it('deve lancar erro se produto nao tiver estoque', async () => {
      // arrange
      mockCustomerService.getCustomerById.mockResolvedValue({
        id: '1',
        name: 'João Silva'
      } as any);

      mockProductService.getProductById.mockResolvedValue({
        id: '1',
        name: 'Produto 1'
      } as any);

      mockProductService.checkStock.mockResolvedValue(false);

      // act & assert
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow(ValidationError);
      
      expect(mockPrisma.order.create).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('deve retornar pedido por id', async () => {
      // arrange
      const order = {
        id: '1',
        customerId: '1',
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount: 100.00
      };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      // act
      const result = await orderService.getOrderById('1');

      // assert
      expect(result).toEqual(order);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          items: true,
          customer: true
        }
      });
    });

    it('deve lancar erro se pedido nao existir', async () => {
      // arrange
      mockPrisma.order.findUnique.mockResolvedValue(null);

      // act & assert
      await expect(orderService.getOrderById('999'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateOrderStatus', () => {
    it('deve atualizar status do pedido', async () => {
      // arrange
      const order = {
        id: '1',
        status: OrderStatus.PENDING_PAYMENT
      };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.CONFIRMED
      });

      // act
      const result = await orderService.updateOrderStatus('1', OrderStatus.CONFIRMED);

      // assert
      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: OrderStatus.CONFIRMED }
      });
    });
  });

  describe('getAllOrders', () => {
    it('deve retornar lista paginada de pedidos', async () => {
      // arrange
      const orders = [
        { id: '1', customerId: '1' },
        { id: '2', customerId: '2' }
      ];
      mockPrisma.order.findMany.mockResolvedValue(orders);
      mockPrisma.order.count.mockResolvedValue(2);

      // act
      const result = await orderService.getAllOrders(1, 10);

      // assert
      expect(result.data).toEqual(orders);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});