import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';       
import { ColumnOrderDto } from './order-columns.dto';

export class ReorderColumnsDto {
  @ApiProperty({ 
    description: 'Array of column orders',
    type: [ColumnOrderDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderDto)
  columnOrders: ColumnOrderDto[];
}