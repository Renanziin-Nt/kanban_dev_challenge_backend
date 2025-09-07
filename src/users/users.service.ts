import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  logger: any;
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
  
  async removeByClerkId(clerkId: string) {
    return this.prisma.user.delete({
      where: { clerkId },
    });
  }
  async syncWithClerk(clerkUser: any) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = clerkUser;
    
    // CORREÇÃO: Verificar se email_addresses existe e tem itens
    const email = email_addresses && email_addresses.length > 0 
      ? email_addresses[0]?.email_address 
      : null; // ou 'no-email@example.com'

    // Se não tiver email, não podemos criar o usuário
    if (!email) {
      this.logger.error(`Não é possível criar usuário ${id} sem email`);
      throw new Error('Email é obrigatório');
    }

    const name = first_name && last_name 
      ? `${first_name} ${last_name}`.trim()
      : first_name || last_name || 'Usuário';

    const existingUser = await this.findByClerkId(id);

    if (existingUser) {
      return this.update(existingUser.id, {
        email,
        name,
        imageUrl: image_url,
      });
    }

    return this.create({
      clerkId: id,
      email,
      name,
      imageUrl: image_url,
    });

  } catch (error) {
    this.logger.error('Erro no syncWithClerk:', error);
    throw error;
  }
}
}