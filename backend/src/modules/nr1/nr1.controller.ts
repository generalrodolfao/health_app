import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Nr1Service } from './nr1.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { User } from '../../common/user.decorator';

@ApiTags('NR-1')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Dashboard NR-1 da empresa' })
  getDashboard(@Param('companyId') companyId: string) {
    return this.nr1Service.getDashboard(companyId);
  }

  @Post('actions/:companyId')
  @ApiOperation({ summary: 'Criar plano de ação' })
  createAction(@Param('companyId') companyId: string, @Body() dto: CreateActionDto) {
    return this.nr1Service.createAction(companyId, dto);
  }

  @Get('actions/:companyId')
  @ApiOperation({ summary: 'Listar ações da empresa' })
  getActions(@Param('companyId') companyId: string) {
    return this.nr1Service.getActions(companyId);
  }

  @Get('history/:companyId')
  @ApiOperation({ summary: 'Histórico de conformidade NR-1' })
  getHistory(@Param('companyId') companyId: string) {
    return this.nr1Service.getHistory(companyId);
  }
}
