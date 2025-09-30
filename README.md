# Desafio Técnico - Sistema de E-commerce

Sistema completo de e-commerce desenvolvido com arquitetura orientada a eventos, utilizando Node.js/TypeScript no backend e React/TypeScript no frontend.

##  Arquitetura do Projeto

```
Desafio-raylabs-mimobi/
├── backend/          # API REST com Node.js + TypeScript
├── frontend/         # Interface React + TypeScript + Material-UI
└── README.md         # Este arquivo
```

##  Tecnologias Utilizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **Prisma ORM** para banco de dados
- **PostgreSQL** como banco principal
- **SQLite** para desenvolvimento
- **Jest** para testes
- **Winston** para logs
- **Arquitetura orientada a eventos**

### Frontend
- **React 18** com TypeScript
- **Material-UI (MUI)** para componentes
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Context API** para gerenciamento de estado

##  Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- PostgreSQL (para produção) ou SQLite (para desenvolvimento)

##  Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Desafio-raylabs-mimobi
```

### 2. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar migrações do banco
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate
```

### 3. Configuração do Frontend

```bash
# Navegar para o diretório do frontend
cd ../frontend

# Instalar dependências
npm install
```

##  Executando o Projeto

### Backend (Porta 3000)
```bash
cd backend
npm run dev
```

O backend estará disponível em: `http://localhost:3000`

### Frontend (Porta 3001)
```bash
cd frontend
npm start
```

O frontend estará disponível em: `http://localhost:3001`

##  Funcionalidades Implementadas

### Backend
-  CRUD completo de Produtos
-  CRUD completo de Clientes
-  Sistema de Pedidos com status
-  Arquitetura orientada a eventos
-  Validação de dados
-  Tratamento de erros
-  Logs estruturados
-  Testes unitários e de integração

### Frontend
-  Listagem de produtos com busca e filtros
-  Carrinho de compras funcional
-  Processo de checkout completo
-  Listagem de pedidos com status
-  Design responsivo com Material-UI
-  Navegação com React Router
-  Integração completa com API

##  Fluxo da Aplicação

1. **Produtos**: Visualizar catálogo com busca e filtros
2. **Carrinho**: Adicionar produtos e gerenciar quantidades
3. **Checkout**: Inserir dados do cliente e finalizar pedido
4. **Pedidos**: Acompanhar status dos pedidos realizados

##  Executando Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

##  Endpoints da API

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Clientes
- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Buscar cliente por ID
- `POST /api/customers` - Criar cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Deletar cliente

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Buscar pedido por ID
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id/status` - Atualizar status do pedido

### Health Check
- `GET /api/health` - Status da API

##  Estrutura do Banco de Dados

### Tabelas Principais
- **customers**: Dados dos clientes
- **products**: Catálogo de produtos
- **orders**: Pedidos realizados
- **order_items**: Itens de cada pedido

##  Interface do Usuário

- **Design moderno** com Material-UI
- **Responsivo** para desktop e mobile
- **Navegação intuitiva** entre as páginas
- **Feedback visual** para ações do usuário
- **Loading states** e tratamento de erros

##  Deploy

### Backend
1. Configure as variáveis de ambiente para produção
2. Execute as migrações: `npx prisma migrate deploy`
3. Inicie o servidor: `npm start`

### Frontend
1. Execute o build: `npm run build`
2. Sirva os arquivos estáticos da pasta `build/`

##  Observações Técnicas

- O sistema utiliza **arquitetura orientada a eventos** no backend
- **Validação robusta** de dados em todas as camadas
- **Tratamento de erros** padronizado
- **Logs estruturados** para monitoramento
- **Testes automatizados** para garantir qualidade
- **TypeScript** em todo o projeto para type safety
