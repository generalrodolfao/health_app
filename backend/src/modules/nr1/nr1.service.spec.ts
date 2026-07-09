import { Test, TestingModule } from '@nestjs/testing';
import { Nr1Service } from './nr1.service';
import { PrismaService } from '../../common/prisma.service';

describe('Nr1Service', () => {
  let service: Nr1Service;

  const mockPrisma = {
    mentalHealthAssessment: { create: jest.fn(), findMany: jest.fn() },
    mentalHealthAction: { create: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Nr1Service, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<Nr1Service>(Nr1Service);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('should set LOW risk for low scores', async () => {
    mockPrisma.mentalHealthAssessment.create.mockResolvedValue({ id: '1', overallRiskLevel: 'LOW' });
    const result = await service.submitAssessment('user-1', {
      responses: { psychologicalDemand: 1, workControl: 2 },
    });
    expect(result.overallRiskLevel).toBe('LOW');
  });
});