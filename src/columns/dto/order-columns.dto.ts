import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, IsArray, ValidateNested, IsNumber } from 'class-validator';


export class ColumnOrderDto {
  @ApiProperty({ description: 'Column ID' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ description: 'New position' })
  @IsNumber()
  position: number;
}