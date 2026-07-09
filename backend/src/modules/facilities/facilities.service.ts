import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { FacilityType } from '@prisma/client';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(lat: number, lng: number, radiusKm: number = 5, type?: FacilityType) {
    const where: any = {
      active: true,
    };

    if (type) where.type = type;

    const facilities = await this.prisma.facility.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        lat: true,
        lng: true,
        openHours: true,
        is24h: true,
        rating: true,
        ratingCount: true,
      },
    });

    const earthRadius = 6371;
    return facilities
      .map((f) => {
        const dLat = this.toRad(f.lat - lat);
        const dLng = this.toRad(f.lng - lng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(this.toRad(lat)) * Math.cos(this.toRad(f.lat)) * Math.sin(dLng / 2) ** 2;
        const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return { ...f, distance: Math.round(distance * 10) / 10 };
      })
      .filter((f) => f.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  async findById(id: string) {
    return this.prisma.facility.findUnique({
      where: { id, active: true },
    });
  }

  async search(query: string) {
    return this.prisma.facility.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query } },
          { address: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async getEmergencyHospital(lat: number, lng: number) {
    const hospitals = await this.findNearby(lat, lng, 20, 'HOSPITAL');
    return hospitals[0] || null;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
