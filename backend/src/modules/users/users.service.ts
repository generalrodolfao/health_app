import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        birthDate: true,
        role: true,
        plan: true,
        emergencyName: true,
        emergencyPhone: true,
        healthPlan: true,
        healthPlanNumber: true,
        healthPlanExpiry: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        emergencyName: dto.emergencyName,
        emergencyPhone: dto.emergencyPhone,
        healthPlan: dto.healthPlan,
        healthPlanNumber: dto.healthPlanNumber,
        healthPlanExpiry: dto.healthPlanExpiry ? new Date(dto.healthPlanExpiry) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emergencyName: true,
        emergencyPhone: true,
        healthPlan: true,
      },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted-${userId}@healthapp.local`,
      },
    });
  }
}
