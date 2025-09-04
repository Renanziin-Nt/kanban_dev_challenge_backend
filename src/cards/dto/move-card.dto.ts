import { ApiProperty} from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
} from 'class-validator';


export class MoveCardDto {
  @ApiProperty({ description: 'Card ID to move' })
  @IsUUID()
  cardId: string;

  @ApiProperty({ description: 'Source column ID' })
  @IsUUID()
  sourceColumnId: string;

  @ApiProperty({ description: 'Target column ID' })
  @IsUUID()
  targetColumnId: string;

  @ApiProperty({ description: 'New position in target column' })
  @IsNumber()
  newPosition: number;
}