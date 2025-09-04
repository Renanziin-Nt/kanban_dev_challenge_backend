import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: 'Board title' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Board description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}