import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CardLogsService } from './card-logs.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ReorderCardsDto } from './dto/reorder-card.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly cardLogsService: CardLogsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card' })
  create(@Body() createCardDto: CreateCardDto, @Request() req) {
    const userId = req.user.sub;
    return this.cardsService.create(createCardDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cards' })
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID with logs' })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get card activity logs' })
  getCardLogs(@Param('id') id: string) {
    return this.cardLogsService.getCardLogs(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update card' })
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.cardsService.update(id, updateCardDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete card' })
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.cardsService.remove(id, userId);
  }

  @Post('move')
  @ApiOperation({ summary: 'Move card between columns or positions' })
  moveCard(@Body() moveCardDto: MoveCardDto, @Request() req) {
    const userId = req.user.sub;
    return this.cardsService.moveCard(moveCardDto, userId);
  }

  @Post('reorder/:columnId')
  @ApiOperation({ summary: 'Reorder cards within a column' })
  reorderCards(
    @Param('columnId') columnId: string,
    @Body() reorderDto: ReorderCardsDto,
  ) {
    return this.cardsService.reorderCards(columnId, reorderDto);
  }

  @Get('board/:boardId/activity')
  @ApiOperation({ summary: 'Get board activity logs' })
  getBoardActivity(
    @Param('boardId') boardId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.cardLogsService.getBoardActivity(boardId, limitNumber);
  }
}