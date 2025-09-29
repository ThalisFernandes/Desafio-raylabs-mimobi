import amqp, { Connection, Channel } from 'amqplib';
import { env } from './env';
import { logInfo, logError } from './logger';

export class RabbitMQConnection {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected = false;
  private fallbackMode = false;

  // conectar ao rabbitmq
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        logInfo('RabbitMQ ja conectado');
        return;
      }

      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      this.isConnected = true;
      this.fallbackMode = false;
      
      logInfo('Conectado ao RabbitMQ com sucesso');

      // listeners para eventos de conexao
      this.connection.on('error', (error) => {
        logError('Erro na conexao RabbitMQ', error);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logInfo('Conexao RabbitMQ fechada');
        this.isConnected = false;
      });

    } catch (error) {
      logError('Erro ao conectar no RabbitMQ, ativando modo fallback', error);
      this.fallbackMode = true;
      this.isConnected = false;
      // nao lanca erro para permitir que a aplicacao continue funcionando
    }
  }

  // desconectar do rabbitmq
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.isConnected = false;
      logInfo('Desconectado do RabbitMQ');
    } catch (error) {
      logError('Erro ao desconectar do RabbitMQ', error);
      throw error;
    }
  }

  // obter canal
  getChannel(): Channel {
    if (this.fallbackMode) {
      logInfo('RabbitMQ em modo fallback - operacao simulada');
      // retorna um mock channel para evitar erros
      return {} as Channel;
    }
    
    if (!this.channel || !this.isConnected) {
      throw new Error('RabbitMQ nao conectado');
    }
    return this.channel;
  }

  // verificar se esta conectado
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  // verificar se esta em modo fallback
  isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  // declarar exchange
  async assertExchange(exchange: string, type: string = 'direct'): Promise<void> {
    if (this.fallbackMode) {
      logInfo(`Exchange ${exchange} simulado em modo fallback`, { type });
      return;
    }
    
    const channel = this.getChannel();
    await channel.assertExchange(exchange, type, { durable: true });
    logInfo(`Exchange ${exchange} declarado`, { type });
  }

  // declarar fila
  async assertQueue(queue: string, options: any = {}): Promise<void> {
    if (this.fallbackMode) {
      logInfo(`Fila ${queue} simulada em modo fallback`);
      return;
    }
    
    const channel = this.getChannel();
    const defaultOptions = { durable: true, ...options };
    await channel.assertQueue(queue, defaultOptions);
    logInfo(`Fila ${queue} declarada`);
  }

  // bind fila ao exchange
  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    if (this.fallbackMode) {
      logInfo(`Fila ${queue} vinculada ao exchange ${exchange} (simulado)`, { routingKey });
      return;
    }
    
    const channel = this.getChannel();
    await channel.bindQueue(queue, exchange, routingKey);
    logInfo(`Fila ${queue} vinculada ao exchange ${exchange}`, { routingKey });
  }
}

// instancia global do rabbitmq
export const rabbitmq = new RabbitMQConnection();