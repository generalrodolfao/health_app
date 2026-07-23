import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';

const NR1_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Se sente pra baixo, deprimido ou sem esperança',
  'Dificuldade para dormir ou dormir demais',
  'Sente-se cansado ou com pouca energia',
  'Falta de apetite ou comendo demais',
  'Se sente ruim consigo mesmo — que é um fracasso',
  'Dificuldade para se concentrar em atividades',
  'Movimento ou fala tão lentos que outros notaram',
  'Pensamentos em se machucar ou que seria melhor não estar vivo',
];

const RESPONSE_OPTIONS = [
  { label: 'Nunca', value: 0 },
  { label: 'Vários dias', value: 1 },
  { label: 'Mais da metade dos dias', value: 2 },
  { label: 'Quase todos os dias', value: 3 },
];

@Injectable()
export class Nr1Service {
  constructor(private readonly prisma: PrismaService) {}

  getQuestions() {
    return NR1_QUESTIONS.map((question, i) => ({
      id: i,
      question,
      options: RESPONSE_OPTIONS,
    }));
  }

  async submitAssessment(userId: string, dto: SubmitAssessmentDto) {
    const scores = Object.values(dto.responses);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const overallRiskLevel = this.scoreToRisk(totalScore);

    const assessment = await this.prisma.mentalHealthAssessment.create({
      data: {
        userId,
        responses: JSON.stringify(dto.responses),
        overallRiskLevel,
        isAnonymous: dto.isAnonymous ?? true,
      },
    });

    return {
      id: assessment.id,
      overallRiskLevel,
      totalScore,
      maxScore: NR1_QUESTIONS.length * 3,
      recommendation: this.getRecommendation(overallRiskLevel),
      assessedAt: assessment.assessedAt,
    };
  }

  async getHistory(userId: string) {
    return this.prisma.mentalHealthAssessment.findMany({
      where: { userId },
      orderBy: { assessedAt: 'desc' },
      select: { id: true, overallRiskLevel: true, assessedAt: true, responses: true },
    });
  }

  async getDashboard(userId: string) {
    const assessments = await this.prisma.mentalHealthAssessment.findMany({
      where: { userId },
    });
    const total = assessments.length;
    const highRisk = assessments.filter((a) => a.overallRiskLevel === 'HIGH' || a.overallRiskLevel === 'CRITICAL').length;
    return {
      totalAssessments: total,
      highRiskCount: highRisk,
      riskPercentage: total ? Math.round((highRisk / total) * 100) : 0,
    };
  }

  async createAction(userId: string, dto: CreateActionDto) {
    return this.prisma.mentalHealthAction.create({
      data: {
        title: dto.title, description: dto.description,
        riskDimension: dto.riskDimension, assignedTo: userId,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async getActions(userId: string) {
    return this.prisma.mentalHealthAction.findMany({
      where: { assignedTo: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private scoreToRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 20) return 'CRITICAL';
    if (score >= 15) return 'HIGH';
    if (score >= 10) return 'MEDIUM';
    if (score >= 5) return 'LOW';
    return 'LOW';
  }

  private getRecommendation(level: string): string {
    const recs: Record<string, string> = {
      LOW: 'Seu resultado sugere baixo risco. Continue cuidando da sua saúde mental.',
      MEDIUM: 'Seu resultado sugere risco moderado. Considere conversar com um profissional.',
      HIGH: 'Seu resultado sugere risco alto. Recomendamos fortemente buscar acompanhamento profissional.',
      CRITICAL: 'Seu resultado sugere risco grave. Busque ajuda profissional imediatamente. Se estiver em crise, ligue 188 (CVV).',
    };
    return recs[level] || recs.LOW;
  }
}