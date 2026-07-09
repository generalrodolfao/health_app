import { Injectable, NotFoundException } from '@nestjs/common';
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
        companyId: dto.companyId,
        departmentId: dto.departmentId,
        psychologicalDemand: scores.psychologicalDemand ?? null,
        workControl: scores.workControl ?? null,
        socialSupport: scores.socialSupport ?? null,
        rewards: scores.rewards ?? null,
        violenceHarassment: scores.violenceHarassment ?? null,
        responses: JSON.stringify(dto.responses),
        overallRiskLevel,
        isAnonymous: dto.isAnonymous ?? true,
      },
    });
  }

  async getCompanyAssessments(companyId: string) {
    return this.prisma.mentalHealthAssessment.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { assessedAt: 'desc' },
    });
  }

  async getDashboard(companyId: string) {
    const assessments = await this.prisma.mentalHealthAssessment.findMany({
      where: { companyId },
    });

    const total = assessments.length;
    const highRisk = assessments.filter((a) => a.overallRiskLevel === 'HIGH' || a.overallRiskLevel === 'CRITICAL').length;

    const actions = await this.prisma.mentalHealthAction.findMany({
      where: { companyId },
    });
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
        companyId,
        title: dto.title,
        description: dto.description,
        riskDimension: dto.riskDimension,
        assignedTo: dto.assignedTo,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async getActions(companyId: string) {
    return this.prisma.mentalHealthAction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHistory(companyId: string) {
    const assessments = await this.prisma.mentalHealthAssessment.findMany({
      where: { companyId },
      orderBy: { assessedAt: 'desc' },
      take: 100,
    });

    const actions = await this.prisma.mentalHealthAction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return { assessments, actions };
  }

  private calculateRiskLevel(scores: Record<string, number>): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const values = Object.values(scores);
    if (values.length === 0) return 'LOW';

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg >= 8) return 'CRITICAL';
    if (avg >= 6) return 'HIGH';
    if (avg >= 4) return 'MEDIUM';
    return 'LOW';
  }
}
