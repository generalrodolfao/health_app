import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CheckupItemStatus, CheckupStatus } from '@prisma/client';

@Injectable()
export class CheckupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    const checkups = await this.prisma.checkup.findMany({
      where: { userId, deletedAt: null },
      include: { items: { orderBy: { category: 'asc' } } },
      orderBy: { year: 'desc' },
    });
    return checkups.map((c) => this.enrichCheckup(c));
  }

  async findById(id: string, userId: string) {
    const checkup = await this.prisma.checkup.findFirst({
      where: { id, userId, deletedAt: null },
      include: { items: { orderBy: { category: 'asc' } } },
    });
    if (!checkup) throw new NotFoundException('Checkup não encontrado');
    return this.enrichCheckup(checkup);
  }

  async create(userId: string, dto: CreateCheckupDto) {
    const existing = await this.prisma.checkup.findUnique({
      where: { userId_year: { userId, year: dto.year } },
    });
    if (existing) throw new BadRequestException('Checkup deste ano já existe');

    const checkup = await this.prisma.checkup.create({
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
    return this.enrichCheckup(checkup);
  }

  async updateItem(itemId: string, userId: string, dto: UpdateItemDto) {
    const item = await this.prisma.checkupItem.findFirst({
      where: { id: itemId, checkup: { userId } },
      include: { checkup: { include: { items: true } } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');

    const updated = await this.prisma.checkupItem.update({
      where: { id: itemId },
      data: {
        status: dto.status,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
        notes: dto.notes,
        fileUrl: dto.fileUrl,
      },
    });

    // Auto-update checkup status based on items
    const checkupItems = item.checkup.items.map((i) =>
      i.id === itemId ? { ...i, status: dto.status } : i,
    );
    const allCompleted = checkupItems.every((i) => i.status === CheckupItemStatus.COMPLETED);
    const anyCompleted = checkupItems.some((i) => i.status === CheckupItemStatus.COMPLETED);

    const newStatus = allCompleted
      ? CheckupStatus.COMPLETED
      : anyCompleted
        ? CheckupStatus.IN_PROGRESS
        : CheckupStatus.PENDING;

    await this.prisma.checkup.update({
      where: { id: item.checkupId },
      data: { status: newStatus },
    });

    return updated;
  }

  async getTimeline(userId: string) {
    const checkups = await this.prisma.checkup.findMany({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { year: 'asc' },
    });
    return checkups.map((c) => this.enrichCheckup(c));
  }

  private enrichCheckup(checkup: any) {
    const completedItems = checkup.items.filter((i: any) => i.status === 'COMPLETED').length;
    const totalItems = checkup.items.length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { ...checkup, completedItems, totalItems, progress };
  }
}