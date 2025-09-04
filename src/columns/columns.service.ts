import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    // Buscar a próxima posição
    const lastColumn = await this.prisma.column.findFirst({
      where: { boardId: createColumnDto.boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    return this.prisma.column.create({
      data: {
        ...createColumnDto,
        position,
      },
      include: {
        cards: {
          orderBy: { position: 'asc' },
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
        },
      },
    });
  }

  async findAllByBoard(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          orderBy: { position: 'asc' },
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
            _count: {
              select: {
                attachments: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.column.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { position: 'asc' },
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
        },
      },
    });
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    return this.prisma.column.update({
      where: { id },
      data: updateColumnDto,
    });
  }

  async remove(id: string) {
    return this.prisma.column.delete({
      where: { id },
    });
  }

  async reorderColumns(boardId: string, reorderDto: ReorderColumnsDto) {
    const { columnOrders } = reorderDto;


    return this.prisma.$transaction(
      columnOrders.map(({ columnId, position }) =>
        this.prisma.column.update({
          where: { id: columnId },
          data: { position },
        }),
      ),
    );
  }
}