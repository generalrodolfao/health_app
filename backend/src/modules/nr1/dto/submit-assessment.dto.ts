import { IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentDto {
  @ApiProperty({ description: 'Respostas: { "0": 0, "1": 2, ... } (pergunta ID -> valor 0-3)' })
  @IsObject()
  responses: Record<string, number>;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}