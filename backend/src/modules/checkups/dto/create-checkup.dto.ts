import { IsInt, IsString, IsArray, ValidateNested, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CheckupItemDto {
  @ApiProperty() @IsString() examType: string;
  @ApiProperty() @IsString() professionalType: string;
  @ApiProperty() @IsString() category: string;
}

export class CreateCheckupDto {
  @ApiProperty() @IsInt() @Min(2000) year: number;
  @ApiProperty() @IsDateString() targetDate: string;
  @ApiProperty({ type: [CheckupItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => CheckupItemDto) items: CheckupItemDto[];
}