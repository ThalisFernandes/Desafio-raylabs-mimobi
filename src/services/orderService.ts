import { prisma } from '../config/database';
import { CreateOrderDTO, Order, OrderStatus, OrderCreatedEvent } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logInfo, logError } from '../config/logger';
import { ProductService } from './productService';
import { MessagingService } from './messagingService';

export class OrderService {
  private productService: ProductService;
  private messagingService: MessagingService;

  constructor() {
    this.productService = new ProductService();
    this.messagingService = new MessagingService();
  }

  // criar novo pedido
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    try {
      // verifica se cliente existe
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      });

      if (!customer) {
        throw new NotFoundError('Cliente');
      }

      // valida se todos os produtos existem e tem estoque
      let totalAmount = 0;
      for (const item of data.items) {
        const product = await this.productService.getProductById(item.productId);
        
        if (!await this.productService.checkStock(item.productId, item.quantity)) {
          throw new ValidationError(`Estoque insuficiente para o produto ${product.name}`);
        }

        totalAmount += product.price * item.quantity;
      }

      // cria o pedido com status PENDING_PAYMENT
      const order = await prisma.order.create({
        data: {
          customerId: data.customerId,
          totalAmount,
          status: OrderStatus.PENDING_PAYMENT,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: 0 // sera preenchido pelo trigger ou atualizacao posterior
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });

      // atualiza os precos unitarios dos itens
      for (const item of order.items) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { unitPrice: item.product.price }
        });
      }

      logInfo('Pedido criado com sucesso', { orderId: order.id, totalAmount });

      // publica evento de pedido criado para processamento assincrono
      const orderEvent: OrderCreatedEvent = {
        orderId: order.id,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price
        })),
        createdAt: order.createdAt
      };

      await this.messagingService.publishOrderCreated(orderEvent);
      
      return order;
    } catch (error) {
      logError('Erro ao criar pedido', error);
      throw error;
    }
  }

  // buscar pedido por id
  async getOrderById(id: string): Promise<Order> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });

      if (!order) {
        throw new NotFoundError('Pedido');
      }

      return order;
    } catch (error) {
      logError('Erro ao buscar pedido', error);
      throw error;
    }
  }

  // listar pedidos com paginacao
  async getAllOrders(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: limit,
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logError('Erro ao listar pedidos', error);
      throw error;
    }
  }

  // atualizar status do pedido
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.getOrderById(id);

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });

      logInfo('Status do pedido atualizado', { orderId: id, newStatus: status });
      return updatedOrder;
    } catch (error) {
      logError('Erro ao atualizar status do pedido', error);
      throw error;
    }
  }

  // buscar pedidos por cliente
  async getOrdersByCustomer(customerId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId },
          skip,
          take: limit,
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({
          where: { customerId }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logError('Erro ao buscar pedidos do cliente', error);
      throw error;
    }
  }

  // buscar pedidos por status
  async getOrdersByStatus(status: OrderStatus, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { status },
          skip,
          take: limit,
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({
          where: { status }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logError('Erro ao buscar pedidos por status', error);
      throw error;
    }
  }
}