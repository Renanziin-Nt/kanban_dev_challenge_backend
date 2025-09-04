import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';       
import { CreateColumnDto } from './create-column.dto';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @ApiProperty({ description: 'Column title', required: false })
  @IsString()
  @MaxLength(100)
  title?: string;
}