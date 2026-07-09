import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class Nr1Service {
  constructor(private readonly prisma: PrismaService) {}

  async submitAssessment(userId: string, dto: SubmitAssessmentDto) {
    const scores = dto.responses as Record<string, number>;
    const overallRiskLevel = this.calculateRiskLevel(scores);

    return this.prisma.mentalHealthAssessment.create({
      data: {
        userId,
        responses: JSON.stringify(dto.responses),
        overallRiskLevel,
        isAnonymous: dto.isAnonymous ?? true,
      },
    });
  }

  async getAssessments() {
    return this.prisma.mentalHealthAssessment.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { assessedAt: 'desc' },
    });
  }

  async getDashboard(companyId: string) {
    const assessments = await this.prisma.mentalHealthAssessment.findMany();
    const total = assessments.length;
    const highRisk = assessments.filter((a) => a.overallRiskLevel === 'HIGH' || a.overallRiskLevel === 'CRITICAL').length;

    const actions = await this.prisma.mentalHealthAction.findMany();
    const completed = actions.filter((a) => a.status === 'COMPLETED').length;

    return {
      totalAssessments: total,
      highRiskCount: highRisk,
      riskPercentage: total ? Math.round((highRisk / total) * 100) : 0,
      totalActions: actions.length,
      completedActions: completed,
      completionRate: actions.length ? Math.round((completed / actions.length) * 100) : 0,
    };
  }

  async createAction(companyId: string, dto: CreateActionDto) {
    return this.prisma.mentalHealthAction.create({
      data: {
        title: dto.title,
        description: dto.description,
        riskDimension: dto.riskDimension,
        assignedTo: dto.assignedTo,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async getActions(companyId: string) {
    return this.prisma.mentalHealthAction.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getHistory(companyId: string) {
    const assessments = await this.prisma.mentalHealthAssessment.findMany({
      orderBy: { assessedAt: 'desc' },
      take: 100,
    });
    const actions = await this.prisma.mentalHealthAction.findMany({ orderBy: { createdAt: 'desc' } });
    return { assessments, actions };
  }

  private calculateRiskLevel(scores: Record<string, number>): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const values = Object.values(scores);
    if (values.length === 0) return 'LOW';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg >= 4.5) return 'CRITICAL';
    if (avg >= 3.5) return 'HIGH';
    if (avg >= 2.5) return 'MEDIUM';
    return 'LOW';
  }
}