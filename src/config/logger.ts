import winston from 'winston';
import { config } from './env';

// configuracao dos formatos de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// configuracao do logger
export const logger = winston.createLogger({
  level: config.log.level,
  format: logFormat,
  defaultMeta: { service: 'ecommerce-api' },
  transports: [
    // log de erros em arquivo separado
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // todos os logs em arquivo geral
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// em desenvolvimento, tambem loga no console
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// funcoes de conveniencia para diferentes niveis de log
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | any) => {
  logger.error(message, { error: error?.stack || error });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};