import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CheckupItemStatus } from '@prisma/client';

export class UpdateItemDto {
  @ApiProperty({ enum: CheckupItemStatus, required: false }) @IsOptional() @IsEnum(CheckupItemStatus) status?: CheckupItemStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() scheduledDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() completedDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fileUrl?: string;
}