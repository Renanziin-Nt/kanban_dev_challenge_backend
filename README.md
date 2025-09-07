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
- Node.js 22.18.0
- Docker & Docker Compose
- Conta no Clerk (para autenticação)
- Conta no Supabase (para PostgreSQL)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd kanban-tech-challenge-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres?schema=public"

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Configure o banco de dados
```bash
# Gerar o Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

### 5. Execute a aplicação

#### Desenvolvimento local
```bash
npm run start:dev
```

#### Com Docker Compose
```bash
docker-compose up -d
```

A API estará disponível em: `http://localhost:3001`
Documentação Swagger: `http://localhost:3001/api/docs`

## 📚 Estrutura da API

### Endpoints Principais

#### Authentication
- Todas as rotas (exceto `/health`) requerem token JWT do Clerk

#### Boards
- `GET /api/v1/boards` - Listar quadros
- `POST /api/v1/boards` - Criar quadro
- `GET /api/v1/boards/:id` - Obter quadro específico
- `PATCH /api/v1/boards/:id` - Atualizar quadro
- `DELETE /api/v1/boards/:id` - Deletar quadro

#### Columns
- `GET /api/v1/columns?boardId=:id` - Listar colunas de um quadro
- `POST /api/v1/columns` - Criar coluna
- `PATCH /api/v1/columns/:id` - Atualizar coluna
- `DELETE /api/v1/columns/:id` - Deletar coluna
- `POST /api/v1/columns/reorder/:boardId` - Reordenar colunas

#### Cards
- `GET /api/v1/cards` - Listar cards
- `POST /api/v1/cards` - Criar card
- `GET /api/v1/cards/:id` - Obter card específico
- `PATCH /api/v1/cards/:id` - Atualizar card
- `DELETE /api/v1/cards/:id` - Deletar card
- `POST /api/v1/cards/move` - Mover card (drag & drop)
- `GET /api/v1/cards/:id/logs` - Histórico do card
- `GET /api/v1/cards/board/:boardId/activity` - Atividade do quadro

#### Users
- `GET /api/v1/users/me` - Perfil do usuário atual
- `GET /api/v1/users` - Listar usuários

#### Uploads
- `POST /api/v1/uploads/:cardId` - Upload de arquivo
- `GET /api/v1/uploads/card/:cardId` - Listar anexos do card
- `GET /api/v1/uploads/file/:filename` - Servir arquivo
- `DELETE /api/v1/uploads/attachment/:id` - Deletar anexo

## 🏗️ Implementação de Drag & Drop

O sistema de drag & drop foi implementado com:

1. **Posicionamento baseado em índices**: Cada card tem uma `position` numérica
2. **Transações de banco**: Movimentações são atômicas
3. **Reordenação automática**: Posições são recalculadas automaticamente
4. **Logs de atividade**: Todo movimento é registrado

### Como funciona o movimento de cards:
```typescript
// Movimento entre colunas diferentes
1. Decrementar posições na coluna origem
2. Incrementar posições na coluna destino
3. Atualizar card com nova coluna e posição
4. Registrar log da movimentação

// Movimento na mesma coluna
1. Calcular direção do movimento (cima/baixo)
2. Ajustar posições dos cards afetados
3. Atualizar posição do card movido
```

## 📊 Gerenciamento de Estado

### Estado das Colunas
- Posições são mantidas em ordem crescente
- Reordenação automática quando colunas são adicionadas/removidas

### Estado dos Cards
- Sistema de posicionamento relativo dentro de cada coluna
- Transações garantem consistência durante movimentações
- Logs completos de todas as alterações

## 🔄 Pipeline de CI/CD

### Estratégia de Deploy

1. **Desenvolvimento Local**
   - Docker Compose para ambiente completo
   - Hot reload com `npm run start:dev`
   - Banco PostgreSQL local

2. **CI/CD Pipeline (GitHub Actions)**
   ```yaml
   Trigger: Push para main branch
   Steps:
   1. Run tests & linting
   2. Build Docker image
   3. Push to AWS ECR
   4. Update ECS task definition
   5. Deploy to ECS cluster
   ```

3. **Infraestrutura AWS**
   - **VPC**: Rede isolada com subnets públicas
   - **ECS Fargate**: Containers serverless
   - **Application Load Balancer**: Distribuição de tráfego
   - **ECR**: Registry privado de containers
   - **CloudWatch**: Logs e monitoramento

### Próximos Passos para Melhorias

Se houvesse mais tempo, implementaria:

1. **Performance & Escalabilidade**
   - Cache com Redis para consultas frequentes
   - Pagination para listas grandes
   - WebSockets para atualizações em tempo real
   - CDN para servir arquivos estáticos

2. **Funcionalidades Avançadas**
   - Sistema de comentários nos cards
   - Notificações por email
   - Templates de quadros
   - Relatórios e analytics
   - Busca avançada e filtros

3. **Segurança & Observabilidade**
   - Rate limiting
   - Audit logs detalhados
   - Métricas de performance
   - Alertas de monitoramento
   - Backup automático

4. **DevOps & Infraestrutura**
   - Auto-scaling baseado em métricas
   - Blue-green deployment
   - Disaster recovery
   - Multi-region deployment

## 🔧 Scripts Disponíveis

```bash
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
```

## 🐳 Docker Commands

```bash
# Desenvolvimento com Docker Compose
docker-compose up -d                    # Iniciar todos os serviços
docker-compose logs -f backend          # Ver logs do backend
docker-compose exec backend npm run prisma:migrate  # Executar migrações

# Build manual
docker build -t kanban-backend .
docker run -p 3001:3001 kanban-backend
```

## 🌐 Deploy na AWS

### Pré-requisitos para Deploy
1. AWS CLI configurado
2. Terraform instalado
3. Secrets configurados no GitHub:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Passos para Deploy

1. **Provisionar infraestrutura**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

2. **Configurar secrets no AWS Systems Manager**
```bash
aws ssm put-parameter --name "/kanban/database-url" --value "your-supabase-url" --type "SecureString"
aws ssm put-parameter --name "/kanban/clerk-secret-key" --value "your-clerk-key" --type "SecureString"
aws ssm put-parameter --name "/kanban/frontend-url" --value "your-frontend-url" --type "SecureString"
```

3. **Push para main branch**
```bash
git push origin main
# GitHub Actions irá automaticamente fazer o deploy
```

## 🎯 Justificativa das Escolhas Tecnológicas

### NestJS
- **Escalabilidade**: Arquitetura modular inspirada no Angular
- **TypeScript nativo**: Type safety e melhor DX
- **Ecossistema robusto**: Decorators, Guards, Interceptors
- **Swagger integrado**: Documentação automática

### Prisma
- **Type-safe**: Client gerado automaticamente
- **Migrations**: Controle de versão do schema
- **Studio**: Interface visual para o banco
- **Performance**: Query optimization automática

### Clerk
- **Simplicidade**: Setup rápido e fácil
- **Segurança**: JWT tokens seguros
- **UI components**: Componentes prontos para frontend
- **Escalabilidade**: Gerencia milhões de usuários

### AWS ECS Fargate
- **Serverless containers**: Sem gerenciamento de servidores
- **Auto-scaling**: Escala automaticamente
- **Cost-effective**: Paga apenas pelo que usa
- **Integração**: Nativo com outros serviços AWS

## 📈 Monitoramento & Logs

### CloudWatch
- Logs estruturados da aplicação
- Métricas de performance
- Alertas automáticos

### Health Checks
- Endpoint `/api/v1/health` para monitoramento
- Verificação de conexão com banco
- Status da aplicação

## 🔒 Segurança

- Autenticação JWT com Clerk
- Validação de dados com class-validator
- Helmet para headers de segurança
- CORS configurado
- Sanitização de uploads

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:
- Documentação da API: `/api/docs`
- Logs da aplicação: CloudWatch ou `docker-compose logs`
- Prisma Studio: `npm run prisma:studio`