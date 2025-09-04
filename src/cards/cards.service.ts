import { Injectable } from '@nestjs/common';
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


    await this.cardLogsService.createLog({
      action: LogAction.CREATED,
      cardId: card.id,
      userId,
      details: JSON.stringify({ title: card.title }),
    });

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

    return updatedCard;
  }

  async remove(id: string, userId: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    
    await this.cardLogsService.createLog({
      action: LogAction.DELETED,
      cardId: id,
      userId,
      details: JSON.stringify({ title: card.title }),
    });

    return this.prisma.card.delete({
      where: { id },
    });
  }

  async moveCard(moveCardDto: MoveCardDto, userId: string) {
    const { cardId, sourceColumnId, targetColumnId, newPosition } = moveCardDto;

    return this.prisma.$transaction(async (tx) => {

      if (sourceColumnId !== targetColumnId) {
        await tx.card.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gt: (await tx.card.findUnique({ where: { id: cardId } })).position },
          },
          data: {
            position: { decrement: 1 },
          },
        });


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

        const currentCard = await tx.card.findUnique({ where: { id: cardId } });
        const currentPosition = currentCard.position;

        if (newPosition > currentPosition) {

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


      const movedCard = await tx.card.update({
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

      return movedCard;
    });
  }

  async reorderCards(columnId: string, reorderDto: ReorderCardsDto) {
    const { cardOrders } = reorderDto;

    return this.prisma.$transaction(
      cardOrders.map(({ cardId, position }) =>
        this.prisma.card.update({
          where: { id: cardId },
          data: { position },
        }),
      ),
    );
  }
}