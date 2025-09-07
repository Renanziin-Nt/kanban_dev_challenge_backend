import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('boards')
export class BoardsController {
  
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards' })
  findAll() {
    return this.boardsService.findAll();
    console.log("BoardsController initialized");
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update board' })
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  remove(@Param('id') id: string) {
    return this.boardsService.remove(id);
  }
}