import { MessagingService } from './messagingService';
import { OrderService } from './orderService';
import { OrderStatus, OrderCreatedEvent, PaymentProcessedEvent } from '../types';
import { logInfo, logError } from '../config/logger';

export class PaymentService {
  private messagingService: MessagingService;
  private orderService: OrderService;

  constructor() {
    this.messagingService = new MessagingService();
    this.orderService = new OrderService();
  }

  // inicializar servico de pagamento
  async initialize(): Promise<void> {
    try {
      const queues = this.messagingService.getQueues();
      
      // consumir eventos de pedidos criados
      await this.messagingService.consumeMessages(
        queues.PAYMENT_PROCESSING,
        this.handleOrderCreated.bind(this)
      );

      logInfo('Servico de pagamento inicializado');
    } catch (error) {
      logError('Erro ao inicializar servico de pagamento', error);
      throw error;
    }
  }

  // processar evento de pedido criado
  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      logInfo('Processando pagamento do pedido', { orderId: event.orderId });

      // simula processamento assincrono do pagamento
      await this.processPayment(event);

    } catch (error) {
      logError('Erro ao processar pagamento', { orderId: event.orderId, error });
      
      // publica evento de falha no pagamento
      await this.publishPaymentFailed(event.orderId, 'Erro interno no processamento');
    }
  }

  // simular processamento de pagamento
  private async processPayment(event: OrderCreatedEvent): Promise<void> {
    // simula delay do processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // simula taxa de sucesso de 85%
    const isPaymentSuccessful = Math.random() > 0.15;

    if (isPaymentSuccessful) {
      await this.publishPaymentConfirmed(event.orderId);
    } else {
      await this.publishPaymentFailed(event.orderId, 'Pagamento rejeitado pelo banco');
    }
  }

  // publicar evento de pagamento confirmado
  private async publishPaymentConfirmed(orderId: string): Promise<void> {
    try {
      const paymentEvent: PaymentProcessedEvent = {
        orderId,
        status: 'confirmed',
        processedAt: new Date(),
        message: 'Pagamento processado com sucesso'
      };

      await this.messagingService.publishPaymentProcessed(paymentEvent);
      
      logInfo('Pagamento confirmado', { orderId });
    } catch (error) {
      logError('Erro ao publicar pagamento confirmado', error);
      throw error;
    }
  }

  // publicar evento de pagamento falhado
  private async publishPaymentFailed(orderId: string, reason: string): Promise<void> {
    try {
      const paymentEvent: PaymentProcessedEvent = {
        orderId,
        status: 'failed',
        processedAt: new Date(),
        message: reason
      };

      await this.messagingService.publishPaymentProcessed(paymentEvent);
      
      logInfo('Pagamento falhado', { orderId, reason });
    } catch (error) {
      logError('Erro ao publicar pagamento falhado', error);
      throw error;
    }
  }

  // processar manualmente um pagamento (para testes)
  async processManualPayment(orderId: string, shouldSucceed: boolean = true): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(orderId);
      
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new Error('Pedido nao esta pendente de pagamento');
      }

      if (shouldSucceed) {
        await this.publishPaymentConfirmed(orderId);
      } else {
        await this.publishPaymentFailed(orderId, 'Pagamento rejeitado manualmente');
      }

    } catch (error) {
      logError('Erro no processamento manual de pagamento', error);
      throw error;
    }
  }

  // obter estatisticas de pagamento (para monitoramento)
  getPaymentStats() {
    // em uma implementacao real, isso viria de um banco de dados
    return {
      successRate: 0.85,
      averageProcessingTime: '2s',
      totalProcessed: 0 // seria calculado dinamicamente
    };
  }
}