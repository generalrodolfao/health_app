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
      include: { items: { orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] } },
      orderBy: { year: 'desc' },
    });
    return checkups.map((c) => this.enrich(c));
  }

  async findById(id: string, userId: string) {
    const checkup = await this.prisma.checkup.findFirst({
      where: { id, userId, deletedAt: null },
      include: { items: { orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!checkup) throw new NotFoundException('Checkup não encontrado');
    return this.enrich(checkup);
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
        items: { create: dto.items.map((i) => ({
          examType: i.examType, professionalType: i.professionalType, category: i.category,
        })) },
      },
      include: { items: true },
    });
    return this.enrich(checkup);
  }

  async addItem(checkupId: string, userId: string, dto: { examType: string; professionalType: string; category: string }) {
    const checkup = await this.prisma.checkup.findFirst({ where: { id: checkupId, userId } });
    if (!checkup) throw new NotFoundException('Checkup não encontrado');
    const item = await this.prisma.checkupItem.create({
      data: { checkupId, examType: dto.examType, professionalType: dto.professionalType, category: dto.category },
    });
    await this.recalcStatus(checkupId);
    return item;
  }

  async updateItem(itemId: string, userId: string, dto: UpdateItemDto) {
    const item = await this.prisma.checkupItem.findFirst({
      where: { id: itemId, checkup: { userId } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');

    const data: any = { notes: dto.notes, fileUrl: dto.fileUrl };
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === CheckupItemStatus.COMPLETED) {
        data.completedDate = dto.completedDate ? new Date(dto.completedDate) : new Date();
      } else if (dto.status === CheckupItemStatus.PENDING) {
        data.completedDate = null;
      }
    }
    if (dto.scheduledDate) data.scheduledDate = new Date(dto.scheduledDate);

    const updated = await this.prisma.checkupItem.update({ where: { id: itemId }, data });
    await this.recalcStatus(item.checkupId);
    return updated;
  }

  async getTimeline(userId: string) {
    const checkups = await this.prisma.checkup.findMany({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { year: 'asc' },
    });
    return checkups.map((c) => this.enrich(c));
  }

  private async recalcStatus(checkupId: string) {
    const items = await this.prisma.checkupItem.findMany({ where: { checkupId } });
    const allDone = items.length > 0 && items.every((i) => i.status === CheckupItemStatus.COMPLETED);
    const anyDone = items.some((i) => i.status === CheckupItemStatus.COMPLETED);
    const status = allDone ? CheckupStatus.COMPLETED : anyDone ? CheckupStatus.IN_PROGRESS : CheckupStatus.PENDING;
    await this.prisma.checkup.update({ where: { id: checkupId }, data: { status } });
  }

  private enrich(checkup: any) {
    const completedItems = checkup.items.filter((i: any) => i.status === 'COMPLETED').length;
    const totalItems = checkup.items.length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { ...checkup, completedItems, totalItems, progress };
  }
}