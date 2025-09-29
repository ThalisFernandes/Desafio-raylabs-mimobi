import { PrismaClient } from '@prisma/client';

// configuracao global para testes
beforeAll(async () => {
  // configurar variaveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ecommerce_test_db?schema=public';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
});

// limpar dados entre testes
afterEach(async () => {
  // limpar banco de dados de teste se necessario
  const prisma = new PrismaClient();
  
  try {
    // deletar dados em ordem para evitar constraint errors
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
  } catch (error) {
    // ignorar erros de limpeza se tabelas nao existirem
  } finally {
    await prisma.$disconnect();
  }
});

// configuracao de timeout global
jest.setTimeout(30000);