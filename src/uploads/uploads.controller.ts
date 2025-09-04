import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../auth/auth.guard';
import * as path from 'path';
import * as fs from 'fs/promises';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':cardId')
  @ApiOperation({ summary: 'Upload file to card' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('cardId') cardId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadFile(file, cardId);
  }

  @Get('card/:cardId')
  @ApiOperation({ summary: 'Get card attachments' })
  getCardAttachments(@Param('cardId') cardId: string) {
    return this.uploadsService.getCardAttachments(cardId);
  }

  @Get('file/:filename')
  @ApiOperation({ summary: 'Serve uploaded file' })
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, filename);
      

      await fs.access(filePath);
      
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(404).json({ message: 'File not found' });
    }
  }

  @Delete('attachment/:id')
  @ApiOperation({ summary: 'Delete attachment' })
  deleteAttachment(@Param('id') id: string) {
    return this.uploadsService.deleteAttachment(id);
  }
}