import { MessagingService } from '../services/messagingService';
import { PaymentService } from '../services/paymentService';
import { StockService } from '../services/stockService';
import { connectDatabase } from '../config/database';
import { logInfo, logError } from '../config/logger';

// classe principal para gerenciar todos os workers
export class WorkerManager {
  private messagingService: MessagingService;
  private paymentService: PaymentService;
  private stockService: StockService;
  private isRunning = false;

  constructor() {
    this.messagingService = new MessagingService();
    this.paymentService = new PaymentService();
    this.stockService = new StockService();
  }

  // inicializar todos os workers
  async start(): Promise<void> {
    try {
      if (this.isRunning) {
        logInfo('Workers ja estao rodando');
        return;
      }

      // conectar ao banco de dados
      await connectDatabase();
      logInfo('Conexao com banco estabelecida para workers');

      // inicializar infraestrutura de mensageria
      await this.messagingService.initialize();
      
      // inicializar servicos assincronos
      await this.paymentService.initialize();
      await this.stockService.initialize();

      this.isRunning = true;
      logInfo('Todos os workers inicializados com sucesso');

    } catch (error) {
      logError('Erro ao inicializar workers', error);
      throw error;
    }
  }

  // parar todos os workers
  async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        logInfo('Workers ja estao parados');
        return;
      }

      // fechar conexoes de mensageria
      await this.messagingService.close();

      this.isRunning = false;
      logInfo('Workers parados com sucesso');

    } catch (error) {
      logError('Erro ao parar workers', error);
      throw error;
    }
  }

  // verificar status dos workers
  getStatus() {
    return {
      isRunning: this.isRunning,
      services: {
        messaging: 'active',
        payment: 'active',
        stock: 'active'
      }
    };
  }
}

// funcao para inicializar workers se executado diretamente
async function startWorkers() {
  const workerManager = new WorkerManager();

  try {
    await workerManager.start();

    // graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logInfo(`Recebido sinal ${signal}. Parando workers...`);
      
      try {
        await workerManager.stop();
        process.exit(0);
      } catch (error) {
        logError('Erro ao parar workers', error);
        process.exit(1);
      }
    };

    // listeners para sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // listener para erros nao capturados
    process.on('uncaughtException', (error) => {
      logError('Erro nao capturado nos workers', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logError('Promise rejeitada nao tratada nos workers', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logError('Erro ao inicializar workers', error);
    process.exit(1);
  }
}

// inicia workers se este arquivo for executado diretamente
if (require.main === module) {
  startWorkers();
}