import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Integration Tests', () => {
  let customerId: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    // conectar ao banco de teste
    await prisma.$connect();
  });

  afterAll(async () => {
    // limpar dados e desconectar
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.$disconnect();
  });

  describe('Customer API', () => {
    describe('POST /api/v1/customers', () => {
      it('deve criar um cliente com sucesso', async () => {
        const customerData = {
          name: 'João Silva',
          email: 'joao.teste@email.com',
          document: '12345678901',
          phone: '11999999999',
          address: 'Rua A, 123'
        };

        const response = await request(app)
          .post('/api/v1/customers')
          .send(customerData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(customerData.name);
        expect(response.body.email).toBe(customerData.email);

        customerId = response.body.id;
      });

      it('deve retornar erro 400 para dados invalidos', async () => {
        const invalidData = {
          name: '',
          email: 'email-invalido'
        };

        await request(app)
          .post('/api/v1/customers')
          .send(invalidData)
          .expect(400);
      });

      it('deve retornar erro 409 para email duplicado', async () => {
        const duplicateData = {
          name: 'Maria Silva',
          email: 'joao.teste@email.com', // mesmo email do teste anterior
          document: '98765432100',
          phone: '11888888888',
          address: 'Rua B, 456'
        };

        await request(app)
          .post('/api/v1/customers')
          .send(duplicateData)
          .expect(409);
      });
    });

    describe('GET /api/v1/customers/:id', () => {
      it('deve retornar cliente por id', async () => {
        const response = await request(app)
          .get(`/api/v1/customers/${customerId}`)
          .expect(200);

        expect(response.body.id).toBe(customerId);
        expect(response.body.name).toBe('João Silva');
      });

      it('deve retornar erro 404 para cliente inexistente', async () => {
        await request(app)
          .get('/api/v1/customers/999')
          .expect(404);
      });
    });

    describe('GET /api/v1/customers', () => {
      it('deve retornar lista paginada de clientes', async () => {
        const response = await request(app)
          .get('/api/v1/customers?page=1&limit=10')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page', 1);
        expect(response.body).toHaveProperty('limit', 10);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Product API', () => {
    describe('POST /api/v1/products', () => {
      it('deve criar um produto com sucesso', async () => {
        const productData = {
          name: 'Smartphone XYZ',
          description: 'Smartphone com 128GB',
          price: 899.99,
          stock: 50,
          category: 'Eletrônicos'
        };

        const response = await request(app)
          .post('/api/v1/products')
          .send(productData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(productData.name);
        expect(response.body.price).toBe(productData.price);

        productId = response.body.id;
      });

      it('deve retornar erro 400 para preco negativo', async () => {
        const invalidData = {
          name: 'Produto Inválido',
          price: -10,
          stock: 5
        };

        await request(app)
          .post('/api/v1/products')
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/v1/products/:id', () => {
      it('deve retornar produto por id', async () => {
        const response = await request(app)
          .get(`/api/v1/products/${productId}`)
          .expect(200);

        expect(response.body.id).toBe(productId);
        expect(response.body.name).toBe('Smartphone XYZ');
      });
    });

    describe('GET /api/v1/products/:id/stock', () => {
      it('deve retornar informacoes de estoque', async () => {
        const response = await request(app)
          .get(`/api/v1/products/${productId}/stock`)
          .expect(200);

        expect(response.body).toHaveProperty('productId', productId);
        expect(response.body).toHaveProperty('stock');
        expect(typeof response.body.stock).toBe('number');
      });
    });
  });

  describe('Order API', () => {
    describe('POST /api/v1/orders', () => {
      it('deve criar um pedido com sucesso', async () => {
        const orderData = {
          customerId,
          items: [
            {
              productId,
              quantity: 2,
              price: 899.99
            }
          ]
        };

        const response = await request(app)
          .post('/api/v1/orders')
          .send(orderData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.customerId).toBe(customerId);
        expect(response.body.status).toBe('PENDING_PAYMENT');
        expect(response.body.totalAmount).toBe(1799.98);

        orderId = response.body.id;
      });

      it('deve retornar erro 404 para cliente inexistente', async () => {
        const orderData = {
          customerId: '999',
          items: [
            {
              productId,
              quantity: 1,
              price: 899.99
            }
          ]
        };

        await request(app)
          .post('/api/v1/orders')
          .send(orderData)
          .expect(404);
      });
    });

    describe('GET /api/v1/orders/:id', () => {
      it('deve retornar pedido por id', async () => {
        const response = await request(app)
          .get(`/api/v1/orders/${orderId}`)
          .expect(200);

        expect(response.body.id).toBe(orderId);
        expect(response.body.customerId).toBe(customerId);
      });
    });

    describe('PUT /api/v1/orders/:id/status', () => {
      it('deve atualizar status do pedido', async () => {
        const response = await request(app)
          .put(`/api/v1/orders/${orderId}/status`)
          .send({ status: 'CONFIRMED' })
          .expect(200);

        expect(response.body.status).toBe('CONFIRMED');
      });

      it('deve retornar erro 400 para status invalido', async () => {
        await request(app)
          .put(`/api/v1/orders/${orderId}/status`)
          .send({ status: 'STATUS_INVALIDO' })
          .expect(400);
      });
    });
  });

  describe('Health Check', () => {
    it('deve retornar status da aplicacao', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});