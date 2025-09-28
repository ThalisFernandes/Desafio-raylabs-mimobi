# Dados de Exemplo para API - E-commerce

Este arquivo contém dados de exemplo e comandos CURL para popular a API do e-commerce com produtos, clientes e pedidos.

## 🔐 Autenticação

**IMPORTANTE**: A partir de agora, todas as rotas da API (exceto `/health`) requerem autenticação via Bearer token.

### Configuração da API Key

1. **Configure a variável de ambiente** no arquivo `.env`:
```bash
API_KEY=minha_api_key_super_secreta_123
```

2. **Inclua o header Authorization** em todas as requisições:
```bash
Authorization: Bearer minha_api_key_super_secreta_123
```

### Exemplo de Requisição Autenticada

```bash
curl -X GET http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"
```

## 🏥 Health Check

```bash
# Health check (sem autenticacao)
curl -X GET http://localhost:3001/api/v1/health
```

## 📦 Produtos

### Criar Produtos

```bash
# Produto 1 - Smartphone
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 8999.99,
    "stock": 25,
    "description": "Smartphone Apple iPhone 15 Pro com 128GB, câmera tripla e chip A17 Pro",
    "category": "Eletrônicos"
  }'

# Produto 2 - Notebook
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "MacBook Air M2",
    "price": 12999.99,
    "stock": 15,
    "description": "Notebook Apple MacBook Air com chip M2, 8GB RAM e 256GB SSD",
    "category": "Eletrônicos"
  }'

# Produto 3 - Fone de Ouvido
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "AirPods Pro 2",
    "price": 2499.99,
    "stock": 50,
    "description": "Fones de ouvido sem fio com cancelamento ativo de ruído",
    "category": "Eletrônicos"
  }'

# Produto 4 - Camiseta
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Camiseta Nike Dri-FIT",
    "price": 89.99,
    "stock": 100,
    "description": "Camiseta esportiva com tecnologia Dri-FIT para absorção do suor",
    "category": "Roupas"
  }'

# Produto 5 - Tênis
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Tênis Adidas Ultraboost",
    "price": 799.99,
    "stock": 30,
    "description": "Tênis de corrida com tecnologia Boost para máximo retorno de energia",
    "category": "Calçados"
  }'

# Produto 6 - Livro
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Clean Code - Robert Martin",
    "price": 79.90,
    "stock": 40,
    "description": "Livro sobre boas práticas de programação e código limpo",
    "category": "Livros"
  }'

# Produto 7 - Mouse
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Mouse Logitech MX Master 3",
    "price": 549.99,
    "stock": 35,
    "description": "Mouse sem fio ergonômico para produtividade avançada",
    "category": "Eletrônicos"
  }'

# Produto 8 - Teclado
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Teclado Mecânico Keychron K2",
    "price": 899.99,
    "stock": 20,
    "description": "Teclado mecânico sem fio com switches Gateron e layout compacto",
    "category": "Eletrônicos"
  }'
```

### Listar Produtos

```bash
# Listar todos os produtos (paginado)
curl -X GET "http://localhost:3001/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar produto por ID (substitua {id} pelo ID real)
curl -X GET http://localhost:3001/api/v1/products/{id} \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Verificar estoque de um produto
curl -X GET http://localhost:3001/api/v1/products/{id}/stock \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"
```

## 👥 Clientes

### Criar Clientes

```bash
# Cliente 1
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "document": "12345678901",
    "phone": "11999999999",
    "address": "Rua das Flores, 123 - São Paulo, SP"
  }'

# Cliente 2
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "document": "98765432100",
    "phone": "11888888888",
    "address": "Av. Paulista, 456 - São Paulo, SP"
  }'

# Cliente 3
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Pedro Oliveira",
    "email": "pedro.oliveira@email.com",
    "document": "11122233344",
    "phone": "11777777777",
    "address": "Rua Augusta, 789 - São Paulo, SP"
  }'

# Cliente 4
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "name": "Ana Costa",
    "email": "ana.costa@email.com",
    "document": "55566677788",
    "phone": "11666666666",
    "address": "Rua Oscar Freire, 321 - São Paulo, SP"
  }'
```

### Listar Clientes

```bash
# Listar todos os clientes
curl -X GET "http://localhost:3001/api/v1/customers?page=1&limit=10" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar cliente por ID
curl -X GET http://localhost:3001/api/v1/customers/{id} \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar cliente por email
curl -X GET http://localhost:3001/api/v1/customers/email/joao.silva@email.com \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar cliente por documento
curl -X GET http://localhost:3001/api/v1/customers/document/12345678901 \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"
```

## 📋 Pedidos

### Criar Pedidos

**Nota**: Para criar pedidos, você precisa dos IDs reais dos clientes e produtos criados anteriormente.

```bash
# Pedido 1 - Substitua {customerId} e {productId} pelos IDs reais
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "customerId": "{customerId}",
    "items": [
      {
        "productId": "{productId}",
        "quantity": 1,
        "price": 8999.99
      },
      {
        "productId": "{productId2}",
        "quantity": 2,
        "price": 2499.99
      }
    ]
  }'

# Exemplo de pedido com dados fictícios (ajuste os IDs)
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "customerId": "clm1234567890",
    "items": [
      {
        "productId": "prd1234567890",
        "quantity": 1,
        "price": 8999.99
      }
    ]
  }'
```

### Listar e Gerenciar Pedidos

```bash
# Listar todos os pedidos
curl -X GET "http://localhost:3001/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar pedido por ID
curl -X GET http://localhost:3001/api/v1/orders/{id} \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar pedidos de um cliente
curl -X GET http://localhost:3001/api/v1/orders/customer/{customerId} \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Buscar pedidos por status
curl -X GET http://localhost:3001/api/v1/orders/status/PENDING_PAYMENT \
  -H "Authorization: Bearer minha_api_key_super_secreta_123"

# Atualizar status do pedido
curl -X PATCH http://localhost:3001/api/v1/orders/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha_api_key_super_secreta_123" \
  -d '{
    "status": "CONFIRMED"
  }'
```

## 🔄 Script de População Completa

Para popular rapidamente o banco com dados de exemplo, execute os comandos na seguinte ordem:

1. **Primeiro, crie os produtos** (execute todos os comandos de criação de produtos)
2. **Depois, crie os clientes** (execute todos os comandos de criação de clientes)
3. **Por último, crie os pedidos** (ajuste os IDs conforme necessário)

## 📊 Status dos Pedidos

Os pedidos podem ter os seguintes status:
- `PENDING_PAYMENT` - Aguardando pagamento
- `CONFIRMED` - Confirmado
- `CANCELLED` - Cancelado
- `PAYMENT_FAILED` - Falha no pagamento

## 🛠️ Dicas de Uso

1. **Salve os IDs**: Após criar produtos e clientes, salve os IDs retornados para usar nos pedidos
2. **Verifique o status**: Use o endpoint de health check para verificar se a API está funcionando
3. **Paginação**: Use os parâmetros `page` e `limit` para navegar pelos resultados
4. **Logs**: Monitore os logs do backend para acompanhar as requisições

## 🔍 Exemplo de Resposta

Ao criar um produto, você receberá uma resposta similar a:

```json
{
  "id": "clm1234567890abcdef",
  "name": "iPhone 15 Pro",
  "price": 8999.99,
  "stock": 25,
  "description": "Smartphone Apple iPhone 15 Pro...",
  "category": "Eletrônicos",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

Use o campo `id` retornado para referenciar o produto em pedidos ou outras operações.