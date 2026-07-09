import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Nr1Service } from './nr1.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';

@ApiTags('NR-1')
@Controller('nr1')
export class Nr1Controller {
  constructor(private readonly nr1Service: Nr1Service) {}

  @Post('assessments')
  @ApiOperation({ summary: 'Submeter avaliação psicossocial' })
  submitAssessment(@Body() dto: SubmitAssessmentDto) {
    return this.nr1Service.submitAssessment('demo-user', dto);
  }

  @Get('assessments/:companyId')
  @ApiOperation({ summary: 'Listar avaliações da empresa' })
  getAssessments(@Param('companyId') companyId: string) {
    return this.nr1Service.getCompanyAssessments(companyId);
  }

  @Get('dashboard/:companyId')
  @ApiOperation({ summary: 'Dashboard NR-1' })
  getDashboard(@Param('companyId') companyId: string) {
    return this.nr1Service.getDashboard(companyId);
  }

  @Post('actions/:companyId')
  @ApiOperation({ summary: 'Criar plano de ação' })
  createAction(@Param('companyId') companyId: string, @Body() dto: CreateActionDto) {
    return this.nr1Service.createAction(companyId, dto);
  }

  @Get('actions/:companyId')
  @ApiOperation({ summary: 'Listar ações' })
  getActions(@Param('companyId') companyId: string) {
    return this.nr1Service.getActions(companyId);
  }

  @Get('history/:companyId')
  @ApiOperation({ summary: 'Histórico NR-1' })
  getHistory(@Param('companyId') companyId: string) {
    return this.nr1Service.getHistory(companyId);
  }
}