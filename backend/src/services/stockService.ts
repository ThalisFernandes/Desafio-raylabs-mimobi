import { MessagingService } from './messagingService';
import { ProductService } from './productService';
import { OrderService } from './orderService';
import { 
  OrderCreatedEvent, 
  StockValidatedEvent, 
  PaymentProcessedEvent,
  OrderStatus 
} from '../types';
import { logInfo, logError } from '../config/logger';

export class StockService {
  private messagingService: MessagingService;
  private productService: ProductService;
  private orderService: OrderService;

  constructor() {
    this.messagingService = new MessagingService();
    this.productService = new ProductService();
    this.orderService = new OrderService();
  }

  // inicializar servico de estoque
  async initialize(): Promise<void> {
    try {
      const queues = this.messagingService.getQueues();
      
      // consumir eventos de pedidos criados para validacao de estoque
      await this.messagingService.consumeMessages(
        queues.STOCK_VALIDATION,
        this.handleOrderCreated.bind(this)
      );

      // consumir eventos de pagamento confirmado para debitar estoque
      await this.messagingService.consumeMessages(
        queues.ORDER_STATUS_UPDATE,
        this.handlePaymentProcessed.bind(this)
      );

      logInfo('Servico de estoque inicializado');
    } catch (error) {
      logError('Erro ao inicializar servico de estoque', error);
      throw error;
    }
  }

  // processar evento de pedido criado (validacao de estoque)
  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      logInfo('Validando estoque do pedido', { orderId: event.orderId });

      const isStockValid = await this.validateOrderStock(event);
      
      const stockEvent: StockValidatedEvent = {
        orderId: event.orderId,
        isValid: isStockValid,
        validatedAt: new Date(),
        items: event.items
      };

      await this.messagingService.publishStockValidated(stockEvent);

      if (!isStockValid) {
        // atualiza status do pedido para cancelado por falta de estoque
        await this.orderService.updateOrderStatus(event.orderId, OrderStatus.CANCELLED);
      }

    } catch (error) {
      logError('Erro ao validar estoque', { orderId: event.orderId, error });
      
      // em caso de erro, considera estoque como invalido
      const stockEvent: StockValidatedEvent = {
        orderId: event.orderId,
        isValid: false,
        validatedAt: new Date(),
        items: event.items
      };

      await this.messagingService.publishStockValidated(stockEvent);
    }
  }

  // processar evento de pagamento (debitar estoque se confirmado)
  private async handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    try {
      if (event.status === 'confirmed') {
        await this.debitOrderStock(event.orderId);
        await this.orderService.updateOrderStatus(event.orderId, OrderStatus.CONFIRMED);
        
        logInfo('Estoque debitado e pedido confirmado', { orderId: event.orderId });
      } else {
        await this.orderService.updateOrderStatus(event.orderId, OrderStatus.CANCELLED);
        
        logInfo('Pedido cancelado por falha no pagamento', { orderId: event.orderId });
      }

    } catch (error) {
      logError('Erro ao processar evento de pagamento', { orderId: event.orderId, error });
    }
  }

  // validar se ha estoque suficiente para todos os itens do pedido
  private async validateOrderStock(event: OrderCreatedEvent): Promise<boolean> {
    try {
      for (const item of event.items) {
        const hasStock = await this.productService.checkStock(item.productId, item.quantity);
        
        if (!hasStock) {
          logInfo('Estoque insuficiente detectado', { 
            productId: item.productId, 
            requested: item.quantity 
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      logError('Erro ao validar estoque dos itens', error);
      return false;
    }
  }

  // debitar estoque de todos os itens do pedido
  private async debitOrderStock(orderId: string): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(orderId);

      for (const item of order.items) {
        await this.productService.debitStock(item.productId, item.quantity);
        
        logInfo('Estoque debitado', { 
          productId: item.productId, 
          quantity: item.quantity 
        });
      }

    } catch (error) {
      logError('Erro ao debitar estoque do pedido', { orderId, error });
      throw error;
    }
  }

  // creditar estoque de volta (para cancelamentos)
  async creditOrderStock(orderId: string): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(orderId);

      for (const item of order.items) {
        await this.productService.creditStock(item.productId, item.quantity);
        
        logInfo('Estoque creditado de volta', { 
          productId: item.productId, 
          quantity: item.quantity 
        });
      }

    } catch (error) {
      logError('Erro ao creditar estoque do pedido', { orderId, error });
      throw error;
    }
  }

  // reservar estoque temporariamente (implementacao futura)
  async reserveStock(orderId: string, durationMinutes: number = 30): Promise<void> {
    // implementacao futura para reserva temporaria de estoque
    logInfo('Reserva de estoque nao implementada ainda', { orderId, durationMinutes });
  }

  // obter relatorio de estoque baixo
  async getLowStockReport(threshold: number = 10) {
    try {
      // em uma implementacao real, isso seria uma query otimizada
      const products = await this.productService.getAllProducts(1, 1000);
      
      const lowStockProducts = products.products.filter(product => 
        product.stock <= threshold
      );

      return {
        threshold,
        count: lowStockProducts.length,
        products: lowStockProducts
      };

    } catch (error) {
      logError('Erro ao gerar relatorio de estoque baixo', error);
      throw error;
    }
  }
}