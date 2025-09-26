# E-commerce API - Desafio Mimobi

Sistema de e-commerce desenvolvido em Node.js com TypeScript, implementando arquitetura de microsserviços com comunicação assíncrona via RabbitMQ.

## 🏗️ Arquitetura

O sistema foi desenvolvido seguindo os princípios de arquitetura limpa e padrões de microsserviços:

### Componentes Principais

- **API REST**: Endpoints para gerenciamento de clientes, produtos e pedidos
- **Sistema de Mensageria**: RabbitMQ para comunicação assíncrona entre serviços
- **Serviços Assíncronos**: 
  - Processamento de pagamentos
  - Validação e controle de estoque
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Workers**: Processamento em background de eventos

### Fluxo de Pedidos

1. Cliente cria pedido via API REST
2. Sistema valida cliente e disponibilidade de produtos
3. Pedido é criado com status `PENDING_PAYMENT`
4. Evento `OrderCreated` é publicado no RabbitMQ
5. Serviço de pagamento processa o pagamento assincronamente
6. Serviço de estoque valida e reserva produtos
7. Status do pedido é atualizado conforme processamento

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **RabbitMQ** - Sistema de mensageria
- **Jest** - Framework de testes
- **Docker** - Containerização

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- RabbitMQ
- Docker (opcional)

### Configuração Local

1. **Clone o repositório**
```bash
git clone <repository-url>
cd Desafio-raylabs-mimobi
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key
RABBITMQ_URL=amqp://guest:guest@localhost:5672
LOG_LEVEL=info
```

4. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate
```

5. **Inicie os serviços**

Terminal 1 - API Principal:
```bash
npm run dev
```

Terminal 2 - Workers Assíncronos:
```bash
npm run dev:workers
```

### Usando Docker

```bash
# Subir infraestrutura (PostgreSQL + RabbitMQ)
docker-compose up -d

# Executar migrações
npm run db:migrate

# Iniciar aplicação
npm run dev
npm run dev:workers
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia API em modo desenvolvimento
npm run dev:workers      # Inicia workers em modo desenvolvimento

# Produção
npm run build           # Compila TypeScript
npm run start           # Inicia API em produção
npm run start:workers   # Inicia workers em produção

# Banco de dados
npm run db:generate     # Gera cliente Prisma
npm run db:migrate      # Executa migrações
npm run db:deploy       # Deploy de migrações (produção)
npm run db:studio       # Interface visual do banco

# Testes
npm run test            # Executa todos os testes
npm run test:watch      # Executa testes em modo watch
npm run test:coverage   # Executa testes com cobertura

# Qualidade de código
npm run lint            # Verifica código com ESLint
npm run lint:fix        # Corrige problemas automaticamente
```

## 📚 API Endpoints

### Clientes

```http
POST   /api/v1/customers           # Criar cliente
GET    /api/v1/customers           # Listar clientes (paginado)
GET    /api/v1/customers/:id       # Buscar cliente por ID
GET    /api/v1/customers/email/:email    # Buscar por email
GET    /api/v1/customers/document/:doc   # Buscar por documento
```

### Produtos

```http
POST   /api/v1/products            # Criar produto
GET    /api/v1/products            # Listar produtos (paginado)
GET    /api/v1/products/:id        # Buscar produto por ID
PUT    /api/v1/products/:id        # Atualizar produto
GET    /api/v1/products/:id/stock  # Verificar estoque
```

### Pedidos

```http
POST   /api/v1/orders              # Criar pedido
GET    /api/v1/orders              # Listar pedidos (paginado)
GET    /api/v1/orders/:id          # Buscar pedido por ID
PUT    /api/v1/orders/:id/status   # Atualizar status do pedido
GET    /api/v1/orders/customer/:customerId  # Pedidos por cliente
GET    /api/v1/orders/status/:status        # Pedidos por status
```

### Health Check

```http
GET    /api/v1/health              # Status da aplicação
```

## 📋 Exemplos de Uso

### Criar Cliente

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678901",
    "phone": "11999999999",
    "address": "Rua A, 123"
  }'
```

### Criar Produto

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone XYZ",
    "description": "Smartphone com 128GB",
    "price": 899.99,
    "stock": 50,
    "category": "Eletrônicos"
  }'
```

### Criar Pedido

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id-here",
    "items": [
      {
        "productId": "product-id-here",
        "quantity": 2,
        "price": 899.99
      }
    ]
  }'
```

## 🧪 Testes

O projeto inclui testes unitários e de integração abrangentes:

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Estrutura de Testes

- `tests/unit/` - Testes unitários dos serviços
- `tests/integration/` - Testes de integração da API
- `tests/setup.ts` - Configuração global dos testes

## 🔄 Sistema de Mensageria

O sistema utiliza RabbitMQ para comunicação assíncrona entre serviços:

### Exchanges e Filas

- **orders.exchange** - Exchange principal para eventos de pedidos
- **payments.exchange** - Exchange para eventos de pagamento
- **stock.exchange** - Exchange para eventos de estoque

### Eventos

- `OrderCreated` - Disparado quando pedido é criado
- `PaymentProcessed` - Resultado do processamento de pagamento
- `StockValidated` - Resultado da validação de estoque

## 🏃‍♂️ Workers

Os workers processam eventos assíncronos em background:

- **PaymentService** - Simula processamento de pagamentos
- **StockService** - Gerencia validação e controle de estoque
- **MessagingService** - Coordena comunicação via RabbitMQ

## 📊 Monitoramento

### Logs

O sistema utiliza Winston para logging estruturado:

- Logs de aplicação em `logs/app.log`
- Logs de erro em `logs/error.log`
- Console logs em desenvolvimento

### Health Check

Endpoint `/api/v1/health` retorna status da aplicação:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 🚀 Deploy

### Variáveis de Ambiente (Produção)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=secure-jwt-secret
RABBITMQ_URL=amqp://user:pass@rabbitmq-host:5672
LOG_LEVEL=warn
```

### Build e Deploy

```bash
# Build da aplicação
npm run build

# Deploy das migrações
npm run db:deploy

# Iniciar em produção
npm start
npm run start:workers
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do GitHub.
