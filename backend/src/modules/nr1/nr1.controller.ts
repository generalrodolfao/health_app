import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Nr1Service } from './nr1.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { CurrentUser } from '../../common/current-user.decorator';

@ApiTags('NR-1')
@Controller('nr1')
export class Nr1Controller {
  constructor(private readonly svc: Nr1Service) {}

  @Get('questions')
  @ApiOperation({ summary: 'Perguntas da avaliação (escala PHQ-9)' })
  getQuestions() { return this.svc.getQuestions(); }

  @Post('assessments')
  @ApiOperation({ summary: 'Submeter avaliação psicossocial' })
  submit(@Body() dto: SubmitAssessmentDto, @CurrentUser() user: any) { return this.svc.submitAssessment(user.id, dto); }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de avaliações' })
  history(@CurrentUser() user: any) { return this.svc.getHistory(user.id); }

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard NR-1' })
  dashboard(@CurrentUser() user: any) { return this.svc.getDashboard(user.id); }

  @Post('actions')
  @ApiOperation({ summary: 'Criar plano de ação' })
  createAction(@Body() dto: CreateActionDto, @CurrentUser() user: any) { return this.svc.createAction(user.id, dto); }

  @Get('actions')
  @ApiOperation({ summary: 'Listar ações' })
  getActions(@CurrentUser() user: any) { return this.svc.getActions(user.id); }
}