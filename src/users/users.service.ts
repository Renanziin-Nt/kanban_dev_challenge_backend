import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        imageUrl: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        imageUrl: true,
        createdAt: true,
      },
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async syncWithClerk(clerkUser: any) {
    const existingUser = await this.findByClerkId(clerkUser.id);
    
    if (existingUser) {
      return this.update(existingUser.id, {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        imageUrl: clerkUser.imageUrl,
      });
    }

    return this.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
    });
  }
}