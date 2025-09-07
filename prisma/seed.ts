import { PrismaClient, Priority, Column } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Limpar dados existentes (opcional - CUIDADO em produção!)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.cardLog.deleteMany();
    await prisma.cardAttachment.deleteMany();
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
  }

  // Criar usuário
  const user = await prisma.user.upsert({
    where: { email: 'admin@kanban.dev' },
    update: {},
    create: {
      clerkId: 'user_example_clerk_id',
      email: 'admin@kanban.dev',
      name: 'Admin User',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
  });

  console.log('👤 Created user:', user.email);

  // Criar board
  const board = await prisma.board.create({
    data: {
      title: 'Projeto Kanban Tech Challenge',
      description: 'Quadro de exemplo para demonstração do sistema Kanban',
    },
  });

  console.log('📋 Created board:', board.title);

  // Definir colunas
  const columns = [
    { title: 'Backlog', position: 0 },
    { title: 'To Do', position: 1 },
    { title: 'In Progress', position: 2 },
    { title: 'Review', position: 3 },
    { title: 'Done', position: 4 },
  ];

  // Criar colunas e mapear por título
  const columnMap: Record<string, Column> = {};
  
  for (const columnData of columns) {
    const column = await prisma.column.create({
      data: {
        ...columnData,
        boardId: board.id,
      },
    });
    columnMap[column.title] = column;
    console.log(`📊 Created column: ${column.title}`);
  }

  // Criar cards usando o mapeamento por título
  const cards = [
    // Done column
    {
      title: 'Setup do projeto backend',
      description: 'Configurar NestJS, Prisma e estrutura inicial do projeto',
      priority: Priority.HIGH,
      columnId: columnMap['Done'].id,
      position: 0,
    },
    {
      title: 'Implementar autenticação',
      description: 'Integrar Clerk para autenticação JWT',
      priority: Priority.HIGH,
      columnId: columnMap['Done'].id,
      position: 1,
    },
    {
      title: 'Criar API de boards e columns',
      description: 'Endpoints para gerenciar quadros e colunas',
      priority: Priority.MEDIUM,
      columnId: columnMap['Done'].id,
      position: 2,
    },

    // Review column
    {
      title: 'Implementar sistema de cards',
      description: 'CRUD completo para cards com drag & drop',
      priority: Priority.HIGH,
      columnId: columnMap['Review'].id,
      position: 0,
    },

    // In Progress column
    {
      title: 'Sistema de uploads',
      description: 'Upload de imagens para os cards',
      priority: Priority.MEDIUM,
      columnId: columnMap['In Progress'].id,
      position: 0,
    },
    {
      title: 'Logs de atividade',
      description: 'Sistema de auditoria para tracking de mudanças',
      priority: Priority.MEDIUM,
      columnId: columnMap['In Progress'].id,
      position: 1,
    },

    // To Do column
    {
      title: 'Documentação da API',
      description: 'Swagger/OpenAPI documentation',
      priority: Priority.LOW,
      columnId: columnMap['To Do'].id,
      position: 0,
    },
    {
      title: 'Testes unitários',
      description: 'Implementar testes para todos os módulos',
      priority: Priority.MEDIUM,
      columnId: columnMap['To Do'].id,
      position: 1,
    },

    // Backlog column
    {
      title: 'Setup CI/CD',
      description: 'GitHub Actions para deploy automático na AWS',
      priority: Priority.HIGH,
      columnId: columnMap['Backlog'].id,
      position: 0,
    },
    {
      title: 'Monitoramento e alertas',
      description: 'CloudWatch logs e métricas de performance',
      priority: Priority.LOW,
      columnId: columnMap['Backlog'].id,
      position: 1,
    },
  ];

  // Criar cards
  for (let i = 0; i < cards.length; i++) {
    const cardData = cards[i];
    const card = await prisma.card.create({
      data: {
        ...cardData,
        creatorId: user.clerkId,
        assigneeId: user.clerkId,
      },
    });
    console.log(`🎯 Created card: ${card.title} (${Object.keys(columnMap).find(key => columnMap[key].id === cardData.columnId)})`);
  }

  // Adicionar alguns logs de exemplo
  const exampleCard = await prisma.card.findFirst({
    where: { title: 'Setup do projeto backend' }
  });

  if (exampleCard) {
    await prisma.cardLog.create({
      data: {
        action: 'CREATED',
        details: 'Card criado via seed',
        userId: user.clerkId,
        cardId: exampleCard.id,
      },
    });

    await prisma.cardLog.create({
      data: {
        action: 'UPDATED',
        details: 'Prioridade definida como HIGH',
        userId: user.clerkId,
        cardId: exampleCard.id,
      },
    });

    console.log('📝 Created example activity logs');
  }

  console.log('✅ Database seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - 1 user`);
  console.log(`   - 1 board`);
  console.log(`   - ${columns.length} columns`);
  console.log(`   - ${cards.length} cards`);
  console.log(`   - 2 activity logs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });