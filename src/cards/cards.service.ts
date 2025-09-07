import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ReorderCardsDto } from './dto/reorder-card.dto';
import { CardLogsService } from './card-logs.service';
import { LogAction } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private cardLogsService: CardLogsService,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string) {
    const lastCard = await this.prisma.card.findFirst({
      where: { columnId: createCardDto.columnId },
      orderBy: { position: 'desc' },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await this.prisma.card.create({
      data: {
        ...createCardDto,
        position,
        creatorId: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Log FORA da transação principal
    try {
      await this.cardLogsService.createLog({
        action: LogAction.CREATED,
        cardId: card.id,
        userId,
        details: JSON.stringify({ title: card.title }),
      });
    } catch (error) {
      console.error('Failed to create log for card creation:', error);
    }

    return card;
  }

  async findAll() {
    return this.prisma.card.findMany({
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attachments: true,
        _count: {
          select: {
            attachments: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.card.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attachments: true,
        logs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, updateCardDto: UpdateCardDto, userId: string) {
    const existingCard = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    const updatedCard = await this.prisma.card.update({
      where: { id },
      data: updateCardDto,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Criar logs FORA da operação principal
    try {
      const changes: Record<string, any> = {};
      if (existingCard.title !== updatedCard.title) changes.title = { from: existingCard.title, to: updatedCard.title };
      if (existingCard.description !== updatedCard.description) changes.description = { from: existingCard.description, to: updatedCard.description };
      if (existingCard.priority !== updatedCard.priority) changes.priority = { from: existingCard.priority, to: updatedCard.priority };
      
      if (existingCard.assigneeId !== updatedCard.assigneeId) {
        if (updatedCard.assigneeId) {
          await this.cardLogsService.createLog({
            action: LogAction.ASSIGNED,
            cardId: id,
            userId,
            details: JSON.stringify({ assigneeId: updatedCard.assigneeId }),
          });
        } else {
          await this.cardLogsService.createLog({
            action: LogAction.UNASSIGNED,
            cardId: id,
            userId,
            details: JSON.stringify({ previousAssigneeId: existingCard.assigneeId }),
          });
        }
      }

      if (Object.keys(changes).length > 0) {
        await this.cardLogsService.createLog({
          action: LogAction.UPDATED,
          cardId: id,
          userId,
          details: JSON.stringify(changes),
        });
      }
    } catch (error) {
      console.error('Failed to create logs for card update:', error);
    }

    return updatedCard;
  }

  async remove(id: string, userId: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    
    const deletedCard = await this.prisma.card.delete({
      where: { id },
    });

    // Log FORA da operação principal
    try {
      await this.cardLogsService.createLog({
        action: LogAction.DELETED,
        cardId: id,
        userId,
        details: JSON.stringify({ title: card.title }),
      });
    } catch (error) {
      console.error('Failed to create log for card deletion:', error);
    }

    return deletedCard;
  }

  async moveCard(moveCardDto: MoveCardDto, userId: string) {
    const { cardId, sourceColumnId, targetColumnId, newPosition } = moveCardDto;
    console.log('MoveCardDto:', userId);
    
    // Transação APENAS para as operações essenciais de movimentação
    const movedCard = await this.prisma.$transaction(async (tx) => {
      if (sourceColumnId !== targetColumnId) {
        // Get the card being moved to get its current position
        const cardToMove = await tx.card.findUnique({ where: { id: cardId } });
        if (!cardToMove) {
          throw new NotFoundException(`Card with ID ${cardId} not found`);
        }

        // Adjust positions in source column
        await tx.card.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gt: cardToMove.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Adjust positions in target column
        await tx.card.updateMany({
          where: {
            columnId: targetColumnId,
            position: { gte: newPosition },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        // Moving within the same column
        const currentCard = await tx.card.findUnique({ where: { id: cardId } });
        if (!currentCard) {
          throw new NotFoundException(`Card with ID ${cardId} not found`);
        }
        
        const currentPosition = currentCard.position;

        if (newPosition > currentPosition) {
          // Moving down
          await tx.card.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gt: currentPosition, lte: newPosition },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else if (newPosition < currentPosition) {
          // Moving up
          await tx.card.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gte: newPosition, lt: currentPosition },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }
      }

      // Update the card's position and column
      return tx.card.update({
        where: { id: cardId },
        data: {
          columnId: targetColumnId,
          position: newPosition,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      });
    }, {
      timeout: 10000, // 10 segundos de timeout
    });

    // Log FORA da transação - pode falhar sem afetar a movimentação
    try {
      await this.cardLogsService.createLog({
        action: LogAction.MOVED,
        cardId,
        userId,
        details: JSON.stringify({
          from: sourceColumnId,
          to: targetColumnId,
          position: newPosition,
        }),
      });
    } catch (error) {
      console.error('Failed to create log for card move:', error);
      // Não re-throw o erro - a movimentação foi bem-sucedida
    }

    return movedCard;
  }

  async reorderCards(columnId: string, reorderDto: ReorderCardsDto) {
    const { cardOrders } = reorderDto;

    // Forma 1: Array de operações (sem suporte a timeout customizado)
    return this.prisma.$transaction(
      cardOrders.map(({ cardId, position }) =>
        this.prisma.card.update({
          where: { id: cardId },
          data: { position },
        }),
      )
    );
  }

  // Versão alternativa com callback function (se precisar de timeout customizado)
  async reorderCardsWithTimeout(columnId: string, reorderDto: ReorderCardsDto) {
    const { cardOrders } = reorderDto;

    return this.prisma.$transaction(async (tx) => {
      const updates = await Promise.all(
        cardOrders.map(({ cardId, position }) =>
          tx.card.update({
            where: { id: cardId },
            data: { position },
          })
        )
      );
      return updates;
    }, {
      timeout: 10000,
    });
  }
}