Desafio Técnico – Desenvolvedor
🎯 Objetivo
Construir uma aplicação com fluxo síncrono (API REST) e fluxo assíncrono (event-driven)
para simular um sistema de e-commerce simplificado.

📌 Desafio
Você deve criar um sistema de pedidos com processamento assíncrono de pagamento e
atualização de estoque.
Funcionalidades
1. Cadastro de clientes
- Nome, e-mail, CPF/CNPJ.
2. Cadastro de produtos
- Nome, preço, estoque.
3. Criação de pedido
- O cliente escolhe produtos e quantidades.
- O pedido inicialmente fica no status "PENDING_PAYMENT".
- Deve ser publicada uma mensagem em um broker (Kafka, RabbitMQ, Redis
Streams, NATS ou outro).

4. Serviço de pagamento (consumidor de eventos)
- Simula o processamento assíncrono do pagamento.
- Ao processar, deve publicar novo evento:
- Se OK → "PAYMENT_CONFIRMED"
- Se falha → "PAYMENT_FAILED"
5. Serviço de estoque (consumidor de eventos)
- Quando receber "PAYMENT_CONFIRMED" deve:
- Validar disponibilidade de estoque.
- Se suficiente, debitar estoque e atualizar pedido para "CONFIRMED".
- Se insuficiente, atualizar pedido para "CANCELLED"`.

6. Consulta de pedidos
- Buscar detalhes do pedido (status deve refletir os eventos processados).
- Listar todos os pedidos de um cliente.

🔧 Requisitos Técnicos
- Back-end em Node.js (TypeScript).
- Mensageria: Kafka, RabbitMQ, Redis Streams ou outro (pode ser em Docker
Compose).
- Banco: PostgreSQL.
- Migrations/scripts para setup.
- Testes automatizados (unitários e integração).
- Documentação de endpoints (Swagger ou README detalhado).

📐 Avaliação de Arquitetura
O candidato deve demonstrar:
- Clareza na separação de responsabilidades (API, serviços assíncronos,
consumidores).
- Uso de pub/sub de forma correta (produtor, consumidores, tópicos/filas).
- Estratégia de consistência eventual (ex: retries, dead letter queue).
- Justificação das decisões arquiteturais.

🚀 Bônus (opcionais)
- Escalabilidade e Resiliência
- Implementar Dead Letter Queue (DLQ) para mensagens com falhas.
- Implementar estratégia de retry com backoff exponencial.
- Concorrência e Consistência
- Garantir que o estoque não seja consumido além do disponível (evitar race
conditions).
- Usar bloqueio otimista/pessimista ou transações no banco.
- Segurança
- Autenticação via JWT.
- Permissões diferenciadas (admin x cliente).
- Infraestrutura
- Subir tudo via Docker Compose.
- Implementar outbox pattern para garantir que eventos não sejam perdidos.
- Frontend

- Criar uma pequena aplicação web (React) que consuma a API:
- Tela de listagem de produtos com botão para adicionar ao carrinho.
- Tela de checkout que cria o pedido.
- Tela de *meus pedidos, onde o status deve atualizar de forma
*assíncrona (ex: polling ou WebSockets).
- Mostrar ao usuário os diferentes estados do pedido:
- PENDING_PAYMENT
- CONFIRMED
- CANCELLED
- PAYMENT_FAILED

📄 Entrega
- Repositório público no GitHub/GitLab.
- README com:
- Passo a passo para rodar o projeto (backend e frontend).
- Arquitetura escolhida.
- Explicação de trade-offs.
- (Se houver bônus implementados, descreva-os).

🔍 Critérios de Avaliação
1. Código limpo e organizado
2. Uso correto de arquitetura assíncrona (event-driven)
3. Boas práticas de design (DDD, SOLID, Clean Architecture)
4. Testes automatizados
5. Robustez (tratamento de erros, retries, consistência eventual)
6. Documentação clara
7. Frontend funcional e integrado com o backend
8. Implementação de bônus (se houver)