import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateColumnDto {
  @ApiProperty({ description: 'Column title' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Board ID' })
  @IsUUID()
  boardId: string;
}