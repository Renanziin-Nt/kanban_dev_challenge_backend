import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, cardId: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }


    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

 
    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }


    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, fileName);

    try {

      await fs.mkdir(uploadDir, { recursive: true });


      await fs.writeFile(filePath, file.buffer);


      const attachment = await this.prisma.cardAttachment.create({
        data: {
          filename: file.originalname,
          fileUrl: `/uploads/${fileName}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          cardId,
        },
      });

      return attachment;
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getCardAttachments(cardId: string) {
    return this.prisma.cardAttachment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAttachment(id: string) {
    const attachment = await this.prisma.cardAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    try {

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = path.basename(attachment.fileUrl);
      const filePath = path.join(uploadDir, fileName);
      
      await fs.unlink(filePath).catch(() => {

      });


      return this.prisma.cardAttachment.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete attachment');
    }
  }
}