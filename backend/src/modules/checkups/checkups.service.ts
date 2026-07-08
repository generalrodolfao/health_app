import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CheckupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.checkup.findMany({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { year: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const checkup = await this.prisma.checkup.findFirst({
      where: { id, userId, deletedAt: null },
      include: { items: true },
    });

    if (!checkup) throw new NotFoundException('Checkup não encontrado');
    return checkup;
  }

  async create(userId: string, dto: CreateCheckupDto) {
    const existing = await this.prisma.checkup.findUnique({
      where: { userId_year: { userId, year: dto.year } },
    });

    if (existing) throw new BadRequestException('Checkup deste ano já existe');

    return this.prisma.checkup.create({
      data: {
        userId,
        year: dto.year,
        targetDate: new Date(dto.targetDate),
        items: {
          create: dto.items.map((item) => ({
            examType: item.examType,
            professionalType: item.professionalType,
            category: item.category,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateItem(itemId: string, userId: string, dto: UpdateItemDto) {
    const item = await this.prisma.checkupItem.findFirst({
      where: { id: itemId, checkup: { userId } },
    });

    if (!item) throw new NotFoundException('Item não encontrado');

    return this.prisma.checkupItem.update({
      where: { id: itemId },
      data: {
        status: dto.status,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
        notes: dto.notes,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async getTimeline(userId: string) {
    return this.prisma.checkup.findMany({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { year: 'asc' },
    });
  }
}
