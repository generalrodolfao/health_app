import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  healthPlan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  healthPlanNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  healthPlanExpiry?: string;
}
