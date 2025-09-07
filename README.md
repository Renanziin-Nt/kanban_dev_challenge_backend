# Kanban Tech Challenge - Backend

Sistema de Quadro Kanban colaborativo desenvolvido com NestJS, Prisma, e PostgreSQL.

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js para APIs escaláveis
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Clerk** - Autenticação e gerenciamento de usuários

### Infraestrutura & Deploy
- **AWS ECS** - Container orchestration
- **AWS ECR** - Container registry
- **AWS Application Load Balancer** - Load balancing
- **AWS VPC** - Rede privada virtual
- **Supabase** - PostgreSQL hospedado
- **GitHub Actions** - CI/CD

### Node.js
- **Versão**: 22.18.0

## 📋 Funcionalidades

### Core Features
- ✅ Autenticação com Clerk
- ✅ Quadro Kanban dinâmico
- ✅ Colunas editáveis e reordenáveis
- ✅ Cards com drag & drop
- ✅ Sistema de prioridades (Alta, Média, Baixa)
- ✅ Atribuição de tarefas
- ✅ Editor rich text para descrições
- ✅ Upload de imagens
- ✅ Histórico de atividades (logs)
- ✅ API RESTful completa

### Recursos Técnicos
- ✅ Swagger/OpenAPI documentation
- ✅ Validação de dados com class-validator
- ✅ Tratamento de erros
- ✅ Health check endpoint
- ✅ Logs estruturados
- ✅ Transações de banco de dados
- ✅ Containerização com Docker

## 🛠️ Setup Local

### Pré-requisitos
- Node.js 22.18.0 ou superior
- Docker & Docker Compose (opcional)
- Conta no Clerk (para autenticação)
- Conta no Supabase (para PostgreSQL)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd kanban-tech-challenge-backend

2. Configure as variáveis de ambiente
bash

cp .env.example .env

Edite o arquivo .env com suas configurações:
env

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://username:password@db.supabase.co:6543/postgres?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://username:password@db.supabase.co:5432/postgres?schema=public"

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

3. Setup com Docker (Recomendado - Mais Fácil)
Pré-requisitos

    Docker e Docker Compose instalados

Como executar
bash

# 1. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 2. Executar com Docker Compose
docker-compose up --build

# 3. Acessar a aplicação
# Backend: http://localhost:3001
# Documentação: http://localhost:3001/api/docs

Comandos Docker úteis
bash

# Executar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Executar migrações manualmente (se necessário)
docker-compose exec backend npx prisma migrate dev

4. Setup Manual (Sem Docker)
Instalar dependências
bash

npm install

Configurar banco de dados
bash

# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Popular banco com dados de exemplo (opcional)
npm run seed

Executar aplicação
bash

# Modo desenvolvimento (hot reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod

5. Configurar Webhooks do Clerk com Ngrok

Para desenvolvimento local, você precisa configurar webhooks do Clerk:
Instalar Ngrok
bash

# Instalar ngrok globalmente
npm install -g ngrok

# Ou usar npx
npx ngrok@latest http 3001

Iniciar Ngrok
bash

# Em um terminal separado, execute:
ngrok http 3001

Configurar Webhook no Clerk Dashboard

    Acesse Clerk Dashboard

    Vá para sua aplicação > Webhooks

    Clique em "Add Endpoint"

    URL do endpoint: https://seu-subdominio.ngrok.io/api/v1/webhooks/clerk

    Selecione os eventos: user.created, user.updated, user.deleted

    Cole o CLERK_WEBHOOK_SECRET do seu .env

Testar Webhook
bash

# Verificar se o webhook está funcionando
curl -X POST http://localhost:3001/api/v1/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test-id" \
  -H "svix-timestamp: test-timestamp" \
  -H "svix-signature: test-signature" \
  -d '{"type": "user.created", "data": {"id": "test-user-id"}}'

📚 Estrutura da API
Endpoints Principais
Authentication

    Todas as rotas (exceto /health) requerem token JWT do Clerk

Boards

    GET /api/v1/boards - Listar quadros

    POST /api/v1/boards - Criar quadro

    GET /api/v1/boards/:id - Obter quadro específico

    PATCH /api/v1/boards/:id - Atualizar quadro

    DELETE /api/v1/boards/:id - Deletar quadro

Columns

    GET /api/v1/columns?boardId=:id - Listar colunas de um quadro

    POST /api/v1/columns - Criar coluna

    PATCH /api/v1/columns/:id - Atualizar coluna

    DELETE /api/v1/columns/:id - Deletar coluna

    POST /api/v1/columns/reorder/:boardId - Reordenar colunas

Cards

    GET /api/v1/cards - Listar cards

    POST /api/v1/cards - Criar card

    GET /api/v1/cards/:id - Obter card específico

    PATCH /api/v1/cards/:id - Atualizar card

    DELETE /api/v1/cards/:id - Deletar card

    POST /api/v1/cards/move - Mover card (drag & drop)

    GET /api/v1/cards/:id/logs - Histórico do card

    GET /api/v1/cards/board/:boardId/activity - Atividade do quadro

Users

    GET /api/v1/users/me - Perfil do usuário atual

    GET /api/v1/users - Listar usuários

Uploads

    POST /api/v1/uploads/:cardId - Upload de arquivo

    GET /api/v1/uploads/card/:cardId - Listar anexos do card

    GET /api/v1/uploads/file/:filename - Servir arquivo

    DELETE /api/v1/uploads/attachment/:id - Deletar anexo

🏗️ Implementação de Drag & Drop

O sistema de drag & drop foi implementado com:

    Posicionamento baseado em índices: Cada card tem uma position numérica

    Transações de banco: Movimentações são atômicas

    Reordenação automática: Posições são recalculadas automaticamente

    Logs de atividade: Todo movimento é registrado

Como funciona o movimento de cards:
typescript

// Movimento entre colunas diferentes
1. Decrementar posições na coluna origem
2. Incrementar posições na coluna destino
3. Atualizar card com nova coluna e posição
4. Registrar log da movimentação

// Movimento na mesma coluna
1. Calcular direção do movimento (cima/baixo)
2. Ajustar posições dos cards afetados
3. Atualizar posição do card movido

📊 Gerenciamento de Estado
Estado das Colunas

    Posições são mantidas em ordem crescente

    Reordenação automática quando colunas são adicionadas/removidas

Estado dos Cards

    Sistema de posicionamento relativo dentro de cada coluna

    Transações garantem consistência durante movimentações

    Logs completos de todas as alterações

🔧 Scripts Disponíveis
bash

# Desenvolvimento
npm run start:dev          # Iniciar em modo desenvolvimento
npm run start:debug       # Iniciar com debugger

# Build & Produção
npm run build              # Build da aplicação
npm run start:prod         # Iniciar em modo produção

# Testes
npm run test               # Executar testes unitários
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com coverage
npm run test:e2e           # Testes end-to-end

# Prisma
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Executar migrações
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:deploy      # Deploy migrações (produção)

# Code Quality
npm run lint               # Executar ESLint
npm run format             # Formatar código

# Docker
npm run docker:build       # Build da imagem Docker
npm run docker:run         # Executar container
npm run docker:compose     # Executar com Docker Compose

🐳 Docker Commands
bash

# Desenvolvimento com Docker Compose
docker-compose up -d                    # Iniciar todos os serviços
docker-compose logs -f backend          # Ver logs do backend
docker-compose exec backend npm run prisma:migrate  # Executar migrações

# Build manual
docker build -t kanban-backend .
docker run -p 3001:3001 --env-file .env kanban-backend


🎯 Justificativa das Escolhas Tecnológicas
NestJS

    Escalabilidade: Arquitetura modular inspirada no Angular

    TypeScript nativo: Type safety e melhor DX

    Ecossistema robusto: Decorators, Guards, Interceptors

    Swagger integrado: Documentação automática

Prisma

    Type-safe: Client gerado automaticamente

    Migrations: Controle de versão do schema

    Studio: Interface visual para o banco

    Performance: Query optimization automática

Clerk

    Simplicidade: Setup rápido e fácil

    Segurança: JWT tokens seguros

    UI components: Componentes prontos para frontend

    Escalabilidade: Gerencia milhões de usuários

AWS ECS Fargate

    Serverless containers: Sem gerenciamento de servidores

    Auto-scaling: Escala automaticamente

    Cost-effective: Paga apenas pelo que usa

    Integração: Nativo com outros serviços AWS

📈 Monitoramento & Logs
CloudWatch

    Logs estruturados da aplicação

    Métricas de performance

    Alertas automáticos

Health Checks

    Endpoint /api/v1/health para monitoramento

    Verificação de conexão com banco

    Status da aplicação

🔒 Segurança

    Autenticação JWT com Clerk

    Validação de dados com class-validator

    Helmet para headers de segurança

    CORS configurado

    Sanitização de uploads

📞 Suporte

Para dúvidas sobre a implementação, consulte:

    Documentação da API: /api/docs

    Logs da aplicação: docker-compose logs

    Prisma Studio: npm run prisma:studio