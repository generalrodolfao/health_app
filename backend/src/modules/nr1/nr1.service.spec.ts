import { Test, TestingModule } from '@nestjs/testing';
import { Nr1Service } from './nr1.service';
import { PrismaService } from '../../common/prisma.service';

describe('Nr1Service', () => {
  let service: Nr1Service;
  let prisma: PrismaService;

  const mockPrisma = {
    mentalHealthAssessment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    mentalHealthAction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Nr1Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<Nr1Service>(Nr1Service);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('submitAssessment', () => {
    it('should create assessment with calculated risk level', async () => {
      mockPrisma.mentalHealthAssessment.create.mockResolvedValue({
        id: '1',
        overallRiskLevel: 'HIGH',
      });

      const result = await service.submitAssessment('user-1', {
        responses: { psychologicalDemand: 8, workControl: 7, socialSupport: 6 },
      });

      expect(result.overallRiskLevel).toBe('HIGH');
    });

    it('should set LOW risk for low scores', async () => {
      mockPrisma.mentalHealthAssessment.create.mockResolvedValue({
        id: '2',
        overallRiskLevel: 'LOW',
      });

      const result = await service.submitAssessment('user-1', {
        responses: { psychologicalDemand: 1, workControl: 2 },
      });

      expect(result.overallRiskLevel).toBe('LOW');
    });

    it('should set CRITICAL risk for very high scores', async () => {
      mockPrisma.mentalHealthAssessment.create.mockResolvedValue({
        id: '3',
        overallRiskLevel: 'CRITICAL',
      });

      const result = await service.submitAssessment('user-1', {
        responses: { psychologicalDemand: 10, workControl: 9, socialSupport: 8 },
      });

      expect(result.overallRiskLevel).toBe('CRITICAL');
    });
  });

  describe('getDashboard', () => {
    it('should return calculated dashboard metrics', async () => {
      mockPrisma.mentalHealthAssessment.findMany.mockResolvedValue([
        { overallRiskLevel: 'HIGH' },
        { overallRiskLevel: 'LOW' },
        { overallRiskLevel: 'CRITICAL' },
        { overallRiskLevel: 'MEDIUM' },
      ]);
      mockPrisma.mentalHealthAction.findMany.mockResolvedValue([
        { status: 'COMPLETED' },
        { status: 'PENDING' },
      ]);

      const result = await service.getDashboard('company-1');

      expect(result.totalAssessments).toBe(4);
      expect(result.highRiskCount).toBe(2);
      expect(result.riskPercentage).toBe(50);
      expect(result.totalActions).toBe(2);
      expect(result.completedActions).toBe(1);
    });
  });
});
