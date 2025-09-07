import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogAction } from '@prisma/client';

interface CreateLogDto {
  action: LogAction;
  cardId: string;
  userId: string;
  details?: string;
}

@Injectable()
export class CardLogsService {
  constructor(private prisma: PrismaService) {}

  async createLog(createLogDto: CreateLogDto) {
    console.log('CreateLogDto:', createLogDto);
    return this.prisma.cardLog.create({
      data: createLogDto,
      include: {
        user: {
          select: {
            clerkId: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async getCardLogs(cardId: string) {
    return this.prisma.cardLog.findMany({
      where: { cardId },
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
    });
  }

  async getBoardActivity(boardId: string, limit = 50) {
    return this.prisma.cardLog.findMany({
      where: {
        card: {
          column: {
            boardId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        card: {
          select: {
            id: true,
            title: true,
            column: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}