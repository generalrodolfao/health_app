import { IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentDto {
  @ApiProperty()
  @IsObject()
  responses: Record<string, number>;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}