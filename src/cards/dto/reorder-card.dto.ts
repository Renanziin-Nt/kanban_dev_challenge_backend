import { ApiProperty} from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,

} from 'class-validator';
import { Type } from 'class-transformer';
import {CardOrderDto} from './order-card.dto';

export class ReorderCardsDto {
  @ApiProperty({ 
    description: 'Array of card orders',
    type: [CardOrderDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardOrderDto)
  cardOrders: CardOrderDto[];
}