import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from '../../common/prisma.service';

describe('FacilitiesService', () => {
  let service: FacilitiesService;

  const mockPrisma = {
    facility: { findMany: jest.fn(), findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacilitiesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<FacilitiesService>(FacilitiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('should return nearest hospital', async () => {
    mockPrisma.facility.findMany.mockResolvedValue([
      { id: '1', name: 'Hospital A', lat: -23.55, lng: -46.63, type: 'HOSPITAL', address: 'Rua A' },
    ]);
    const result = await service.getEmergencyHospital(-23.55, -46.63);
    expect(result).toBeTruthy();
    expect(result!.id).toBe('1');
  });
});