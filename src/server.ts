import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logInfo, logError } from './config/logger';

// funcao para inicializar o servidor
async function startServer() {
  try {
    // conecta ao banco de dados
    await connectDatabase();
    logInfo('Conexao com banco de dados estabelecida');

    // inicia o servidor
    const server = app.listen(env.PORT, () => {
      logInfo(`Servidor rodando na porta ${env.PORT}`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });

    // graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logInfo(`Recebido sinal ${signal}. Iniciando shutdown graceful...`);
      
      server.close(async () => {
        logInfo('Servidor HTTP fechado');
        
        try {
          await disconnectDatabase();
          logInfo('Conexao com banco de dados fechada');
          process.exit(0);
        } catch (error) {
          logError('Erro ao fechar conexao com banco', error);
          process.exit(1);
        }
      });
    };

    // listeners para sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // listener para erros nao capturados
    process.on('uncaughtException', (error) => {
      logError('Erro nao capturado', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logError('Promise rejeitada nao tratada', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logError('Erro ao inicializar servidor', error);
    process.exit(1);
  }
}

// inicia o servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}