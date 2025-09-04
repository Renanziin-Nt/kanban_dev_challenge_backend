import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('columns')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get columns by board ID' })
  findAllByBoard(@Query('boardId') boardId: string) {
    return this.columnsService.findAllByBoard(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get column by ID' })
  findOne(@Param('id') id: string) {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update column' })
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete column' })
  remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }

  @Post('reorder/:boardId')
  @ApiOperation({ summary: 'Reorder columns in a board' })
  reorderColumns(
    @Param('boardId') boardId: string,
    @Body() reorderDto: ReorderColumnsDto,
  ) {
    return this.columnsService.reorderColumns(boardId, reorderDto);
  }
}