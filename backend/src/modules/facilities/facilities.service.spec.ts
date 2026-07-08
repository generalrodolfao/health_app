import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from '../../common/prisma.service';

describe('FacilitiesService', () => {
  let service: FacilitiesService;
  let prisma: PrismaService;

  const mockPrisma = {
    facility: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findNearby', () => {
    it('should return facilities sorted by distance', async () => {
      const mockedFacilities = [
        { id: '1', name: 'Hospital A', lat: -23.55, lng: -46.63, type: 'HOSPITAL', address: 'Rua A', phone: '111', openHours: '24h', is24h: true, rating: 4.5, ratingCount: 100 },
        { id: '2', name: 'Farmácia B', lat: -23.56, lng: -46.64, type: 'PHARMACY', address: 'Rua B', phone: '222', openHours: '08-22', is24h: false, rating: 4.0, ratingCount: 50 },
      ];
      mockPrisma.facility.findMany.mockResolvedValue(mockedFacilities);

      const result = await service.findNearby(-23.55, -46.63, 10);

      expect(result).toHaveLength(2);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
    });

    it('should filter by type', async () => {
      mockPrisma.facility.findMany.mockResolvedValue([]);
      await service.findNearby(-23.55, -46.63, 5, 'HOSPITAL');

      expect(mockPrisma.facility.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            active: true,
            type: 'HOSPITAL',
          }),
        }),
      );
    });
  });

  describe('getEmergencyHospital', () => {
    it('should return the nearest hospital', async () => {
      const mockHospital = { id: '1', name: 'Hospital Central', lat: -23.55, lng: -46.63, type: 'HOSPITAL', address: 'Rua X' };
      mockPrisma.facility.findMany.mockResolvedValue([mockHospital]);

      const result = await service.getEmergencyHospital(-23.55, -46.63);
      expect(result).toBeTruthy();
      expect(result.id).toBe('1');
    });

    it('should return null when no hospitals found', async () => {
      mockPrisma.facility.findMany.mockResolvedValue([]);
      const result = await service.getEmergencyHospital(-23.55, -46.63);
      expect(result).toBeNull();
    });
  });
});
