import { ApiProperty} from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CardOrderDto {
  @ApiProperty({ description: 'Card ID' })
  @IsUUID()
  cardId: string;

  @ApiProperty({ description: 'New position' })
  @IsNumber()
  position: number;
}