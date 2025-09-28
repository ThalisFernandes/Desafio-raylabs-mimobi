# Frontend - E-commerce Mimobi

Interface web moderna desenvolvida em React com TypeScript e Material-UI para o sistema de e-commerce.

## 🚀 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Material-UI (MUI)** para componentes e design system
- **React Router** para navegação
- **Axios** para comunicação com API
- **Context API** para gerenciamento de estado do carrinho

## 📋 Funcionalidades

### ✅ Implementadas

- **Listagem de Produtos**: Visualização com filtros por categoria, busca e ordenação
- **Carrinho de Compras**: Adicionar/remover produtos, controle de quantidade
- **Checkout**: Formulário de dados do cliente e criação de pedidos
- **Meus Pedidos**: Visualização com atualização automática de status
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Integração com API**: Comunicação completa com backend

### 🎨 Interface

- Design moderno com Material-UI
- Tema personalizado com cores consistentes
- Componentes reutilizáveis
- Feedback visual para ações do usuário
- Loading states e tratamento de erros

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Backend rodando na porta 3000

### Passos para executar

1. **Instalar dependências**:
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente** (opcional):
```bash
# Criar arquivo .env.local se necessário
REACT_APP_API_URL=http://localhost:3000
```

3. **Executar em modo desenvolvimento**:
```bash
npm start
```

4. **Acessar aplicação**:
```
http://localhost:3001
```

### Scripts Disponíveis

```bash
# Executar em desenvolvimento
npm start

# Executar testes
npm test

# Build para produção
npm run build

# Analisar bundle
npm run analyze
```

## 📱 Funcionalidades da Interface

### Página de Produtos
- Grid responsivo de produtos
- Filtros por categoria e busca por nome
- Ordenação por preço, nome e estoque
- Controle de quantidade antes de adicionar ao carrinho
- Indicadores visuais de estoque

### Carrinho de Compras
- Visualização de itens adicionados
- Controle de quantidade individual
- Cálculo automático de totais
- Remoção de itens
- Resumo do pedido

### Checkout
- Formulário de dados do cliente
- Validação de campos obrigatórios
- Confirmação de pedido
- Feedback de sucesso/erro

### Meus Pedidos
- Lista de todos os pedidos realizados
- Filtros por status (Pendente, Confirmado, Cancelado)
- Atualização automática a cada 10 segundos
- Detalhes expandíveis de cada pedido
- Histórico de alterações de status

## 🔄 Integração com Backend

### Endpoints Utilizados

- `GET /products` - Listar produtos
- `POST /customers` - Criar cliente
- `POST /orders` - Criar pedido
- `GET /orders` - Listar pedidos
- `GET /health` - Status da API

### Tratamento de Erros

- Interceptador Axios para erros HTTP
- Mensagens de erro amigáveis
- Fallbacks para quando API está indisponível
- Loading states durante requisições

## 🎯 Fluxo de Uso

1. **Navegar pelos produtos** na página inicial
2. **Adicionar produtos ao carrinho** com quantidade desejada
3. **Visualizar carrinho** e ajustar itens se necessário
4. **Fazer checkout** preenchendo dados pessoais
5. **Acompanhar pedidos** na página "Meus Pedidos"
6. **Ver atualizações automáticas** de status dos pedidos

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout/         # Header e Layout principal
│   ├── Products/       # Componentes de produtos
│   ├── Cart/          # Componentes do carrinho
│   ├── Orders/        # Componentes de pedidos
│   └── Common/        # Componentes genéricos
├── pages/             # Páginas principais
│   ├── ProductsPage.tsx
│   ├── CartPage.tsx
│   └── OrdersPage.tsx
├── context/           # Context API
│   └── CartContext.tsx
├── services/          # Integração com API
│   └── api.ts
├── types/            # Definições TypeScript
│   └── index.ts
└── App.tsx           # Componente principal
```

## 🔧 Configurações

### Tema Material-UI

O tema está configurado em `App.tsx` com:
- Cores primárias e secundárias personalizadas
- Tipografia otimizada
- Componentes com bordas arredondadas
- Sombras suaves

### Responsividade

Utiliza o sistema de breakpoints do Material-UI:
- `xs`: 0px+
- `sm`: 600px+
- `md`: 900px+
- `lg`: 1200px+

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com API**:
   - Verificar se backend está rodando na porta 3000
   - Confirmar URL da API nas configurações

2. **Produtos não carregam**:
   - Verificar se há produtos cadastrados no backend
   - Checar logs do console para erros de rede

3. **Pedidos não aparecem**:
   - Confirmar se pedidos foram criados com sucesso
   - Verificar se workers do backend estão processando

### Logs Úteis

- Console do navegador para erros JavaScript
- Network tab para requisições HTTP
- React DevTools para debug de componentes

## 📈 Melhorias Futuras

- Autenticação de usuários
- Histórico de navegação
- Wishlist de produtos
- Notificações push para status de pedidos
- PWA (Progressive Web App)
- Testes automatizados com Jest/Testing Library
