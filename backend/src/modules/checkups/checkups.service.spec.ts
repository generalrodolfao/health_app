import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckupsService } from './checkups.service';
import { PrismaService } from '../../common/prisma.service';

describe('CheckupsService', () => {
  let service: CheckupsService;
  let prisma: PrismaService;

  const mockPrisma = {
    checkup: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    checkupItem: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckupsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CheckupsService>(CheckupsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a checkup with items', async () => {
      mockPrisma.checkup.findUnique.mockResolvedValue(null);
      mockPrisma.checkup.create.mockResolvedValue({
        id: '1',
        year: 2026,
        items: [{ examType: 'Sangue' }],
      });

      const result = await service.create('user-1', {
        year: 2026,
        targetDate: '2026-03-15',
        items: [{ examType: 'Sangue', professionalType: 'Laboratório', category: 'Rotina' }],
      });

      expect(result.id).toBe('1');
      expect(mockPrisma.checkup.create).toHaveBeenCalled();
    });

    it('should throw if checkup for year already exists', async () => {
      mockPrisma.checkup.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('user-1', {
          year: 2026,
          targetDate: '2026-03-15',
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return checkup with items', async () => {
      mockPrisma.checkup.findFirst.mockResolvedValue({
        id: '1',
        userId: 'user-1',
        items: [],
      });

      const result = await service.findById('1', 'user-1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.checkup.findFirst.mockResolvedValue(null);

      await expect(service.findById('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
