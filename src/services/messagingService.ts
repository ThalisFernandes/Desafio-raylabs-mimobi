import { rabbitmq } from '../config/rabbitmq';
import { logInfo, logError } from '../config/logger';
import { 
  OrderCreatedEvent, 
  PaymentProcessedEvent, 
  StockValidatedEvent,
  MessageEvent 
} from '../types';

export class MessagingService {
  // exchanges e filas do sistema
  private readonly EXCHANGES = {
    ORDERS: 'orders.exchange',
    PAYMENTS: 'payments.exchange',
    STOCK: 'stock.exchange'
  };

  private readonly QUEUES = {
    ORDER_CREATED: 'order.created.queue',
    PAYMENT_PROCESSING: 'payment.processing.queue',
    STOCK_VALIDATION: 'stock.validation.queue',
    ORDER_STATUS_UPDATE: 'order.status.update.queue'
  };

  private readonly ROUTING_KEYS = {
    ORDER_CREATED: 'order.created',
    PAYMENT_CONFIRMED: 'payment.confirmed',
    PAYMENT_FAILED: 'payment.failed',
    STOCK_VALIDATED: 'stock.validated',
    STOCK_INSUFFICIENT: 'stock.insufficient'
  };

  // inicializar infraestrutura de mensageria
  async initialize(): Promise<void> {
    try {
      // conectar ao rabbitmq
      await rabbitmq.connect();

      // declarar exchanges
      await rabbitmq.assertExchange(this.EXCHANGES.ORDERS);
      await rabbitmq.assertExchange(this.EXCHANGES.PAYMENTS);
      await rabbitmq.assertExchange(this.EXCHANGES.STOCK);

      // declarar filas
      await rabbitmq.assertQueue(this.QUEUES.ORDER_CREATED);
      await rabbitmq.assertQueue(this.QUEUES.PAYMENT_PROCESSING);
      await rabbitmq.assertQueue(this.QUEUES.STOCK_VALIDATION);
      await rabbitmq.assertQueue(this.QUEUES.ORDER_STATUS_UPDATE);

      // bind filas aos exchanges
      await rabbitmq.bindQueue(
        this.QUEUES.ORDER_CREATED, 
        this.EXCHANGES.ORDERS, 
        this.ROUTING_KEYS.ORDER_CREATED
      );

      await rabbitmq.bindQueue(
        this.QUEUES.PAYMENT_PROCESSING, 
        this.EXCHANGES.ORDERS, 
        this.ROUTING_KEYS.ORDER_CREATED
      );

      await rabbitmq.bindQueue(
        this.QUEUES.STOCK_VALIDATION, 
        this.EXCHANGES.ORDERS, 
        this.ROUTING_KEYS.ORDER_CREATED
      );

      await rabbitmq.bindQueue(
        this.QUEUES.ORDER_STATUS_UPDATE, 
        this.EXCHANGES.PAYMENTS, 
        this.ROUTING_KEYS.PAYMENT_CONFIRMED
      );

      await rabbitmq.bindQueue(
        this.QUEUES.ORDER_STATUS_UPDATE, 
        this.EXCHANGES.PAYMENTS, 
        this.ROUTING_KEYS.PAYMENT_FAILED
      );

      await rabbitmq.bindQueue(
        this.QUEUES.ORDER_STATUS_UPDATE, 
        this.EXCHANGES.STOCK, 
        this.ROUTING_KEYS.STOCK_VALIDATED
      );

      logInfo('Infraestrutura de mensageria inicializada com sucesso');
    } catch (error) {
      logError('Erro ao inicializar mensageria', error);
      throw error;
    }
  }

  // publicar evento de pedido criado
  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      const channel = rabbitmq.getChannel();
      const message = Buffer.from(JSON.stringify(event));

      await channel.publish(
        this.EXCHANGES.ORDERS,
        this.ROUTING_KEYS.ORDER_CREATED,
        message,
        { persistent: true }
      );

      logInfo('Evento ORDER_CREATED publicado', { orderId: event.orderId });
    } catch (error) {
      logError('Erro ao publicar evento ORDER_CREATED', error);
      throw error;
    }
  }

  // publicar evento de pagamento processado
  async publishPaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    try {
      const channel = rabbitmq.getChannel();
      const message = Buffer.from(JSON.stringify(event));
      
      const routingKey = event.status === 'confirmed' 
        ? this.ROUTING_KEYS.PAYMENT_CONFIRMED 
        : this.ROUTING_KEYS.PAYMENT_FAILED;

      await channel.publish(
        this.EXCHANGES.PAYMENTS,
        routingKey,
        message,
        { persistent: true }
      );

      logInfo('Evento PAYMENT_PROCESSED publicado', { 
        orderId: event.orderId, 
        status: event.status 
      });
    } catch (error) {
      logError('Erro ao publicar evento PAYMENT_PROCESSED', error);
      throw error;
    }
  }

  // publicar evento de estoque validado
  async publishStockValidated(event: StockValidatedEvent): Promise<void> {
    try {
      const channel = rabbitmq.getChannel();
      const message = Buffer.from(JSON.stringify(event));
      
      const routingKey = event.isValid 
        ? this.ROUTING_KEYS.STOCK_VALIDATED 
        : this.ROUTING_KEYS.STOCK_INSUFFICIENT;

      await channel.publish(
        this.EXCHANGES.STOCK,
        routingKey,
        message,
        { persistent: true }
      );

      logInfo('Evento STOCK_VALIDATED publicado', { 
        orderId: event.orderId, 
        isValid: event.isValid 
      });
    } catch (error) {
      logError('Erro ao publicar evento STOCK_VALIDATED', error);
      throw error;
    }
  }

  // consumir mensagens de uma fila
  async consumeMessages(
    queue: string, 
    handler: (message: MessageEvent) => Promise<void>
  ): Promise<void> {
    try {
      const channel = rabbitmq.getChannel();

      await channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);
            channel.ack(msg);
            
            logInfo('Mensagem processada com sucesso', { queue });
          } catch (error) {
            logError('Erro ao processar mensagem', { queue, error });
            channel.nack(msg, false, false); // rejeita sem requeue
          }
        }
      });

      logInfo(`Consumidor iniciado para fila ${queue}`);
    } catch (error) {
      logError('Erro ao iniciar consumidor', { queue, error });
      throw error;
    }
  }

  // obter nomes das filas (para uso nos consumidores)
  getQueues() {
    return this.QUEUES;
  }

  // fechar conexao
  async close(): Promise<void> {
    await rabbitmq.disconnect();
  }
}