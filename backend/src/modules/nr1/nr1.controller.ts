import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Nr1Service } from './nr1.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';

@ApiTags('NR-1')
@Controller('nr1')
export class Nr1Controller {
  constructor(private readonly svc: Nr1Service) {}

  @Get('questions')
  @ApiOperation({ summary: 'Perguntas da avaliação (escala PHQ-9)' })
  getQuestions() { return this.svc.getQuestions(); }

  @Post('assessments')
  @ApiOperation({ summary: 'Submeter avaliação psicossocial' })
  submit(@Body() dto: SubmitAssessmentDto) { return this.svc.submitAssessment('demo-user', dto); }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de avaliações' })
  history() { return this.svc.getHistory('demo-user'); }

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard NR-1' })
  dashboard() { return this.svc.getDashboard(); }

  @Post('actions')
  @ApiOperation({ summary: 'Criar plano de ação' })
  createAction(@Body() dto: CreateActionDto) { return this.svc.createAction(dto); }

  @Get('actions')
  @ApiOperation({ summary: 'Listar ações' })
  getActions() { return this.svc.getActions(); }
}