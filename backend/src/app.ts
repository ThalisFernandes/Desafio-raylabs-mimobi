import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logInfo } from './config/logger';

const app = express();

// middlewares de seguranca
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// middleware de compressao
app.use(compression());

// middleware de log de requisicoes
app.use((req, res, next) => {
  logInfo('Requisicao recebida', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});

// rotas da api
app.use('/api/v1', apiRoutes);

// rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API - Sistema de pedidos com eventos',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      customers: '/api/v1/customers',
      products: '/api/v1/products',
      orders: '/api/v1/orders'
    }
  });
});

// middleware de tratamento de rotas nao encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota nao encontrada'
  });
});

// middleware de tratamento de erros
app.use(errorHandler);

export { app };