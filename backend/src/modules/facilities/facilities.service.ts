import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface NearbyFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distance: number;
  is24h?: boolean;
  openHours?: string;
}

const OSM_TAGS: Record<string, string[]> = {
  HOSPITAL: ['amenity=hospital', 'amenity=clinic'],
  PHARMACY: ['amenity=pharmacy'],
  CLINIC: ['amenity=doctors', 'amenity=dentist', 'healthcare=clinic'],
  LABORATORY: ['healthcare=laboratory', 'amenity=healthcare'],
};

const OSM_TYPE_MAP: Record<string, string> = {
  hospital: 'HOSPITAL',
  clinic: 'CLINIC',
  pharmacy: 'PHARMACY',
  doctors: 'CLINIC',
  dentist: 'CLINIC',
};

@Injectable()
export class FacilitiesService {
  private readonly logger = new Logger(FacilitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findNearby(lat: number, lng: number, radiusKm: number = 5, type?: string): Promise<NearbyFacility[]> {
    // Query Overpass API for real OSM data
    const osmFacilities = await this.queryOverpass(lat, lng, radiusKm, type);

    // Also query local DB for any manually added facilities
    const dbFacilities = await this.queryDb(lat, lng, radiusKm, type);

    // Merge, dedupe by name+lat+lng, sort by distance
    const all = [...osmFacilities, ...dbFacilities];
    const seen = new Set<string>();
    const unique = all.filter((f) => {
      const key = `${f.name}-${f.lat.toFixed(4)}-${f.lng.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => a.distance - b.distance).slice(0, 50);
  }

  async findById(id: string) {
    return this.prisma.facility.findUnique({ where: { id } });
  }

  async search(query: string) {
    return this.prisma.facility.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  }

  async getEmergencyHospital(lat: number, lng: number): Promise<NearbyFacility | null> {
    const hospitals = await this.findNearby(lat, lng, 20, 'HOSPITAL');
    return hospitals[0] || null;
  }

  private async queryOverpass(lat: number, lng: number, radiusKm: number, type?: string): Promise<NearbyFacility[]> {
    const radiusM = Math.min(radiusKm * 1000, 50000); // Overpass max ~50km

    const typesToQuery = type ? [type] : Object.keys(OSM_TAGS);
    const tagFilters = typesToQuery
      .flatMap((t) => OSM_TAGS[t] || [])
      .map((tag) => `node["${tag.split('=')[0]}"="${tag.split('=')[1]}"](around:${radiusM},${lat},${lng});`)
      .join('');

    const query = `[out:json][timeout:10];(${tagFilters});out body 50;`;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) throw new Error(`Overpass ${res.status}`);

      const data = await res.json() as { elements: any[] };
      return data.elements
        .filter((e: any) => e.tags?.name)
        .map((e: any) => {
          const osmType = this.detectType(e.tags);
          return {
            id: `osm-${e.id}`,
            name: e.tags.name,
            type: osmType,
            address: this.buildAddress(e.tags),
            phone: e.tags['phone'] || e.tags['contact:phone'] || undefined,
            lat: e.lat,
            lng: e.lon,
            distance: this.haversine(lat, lng, e.lat, e.lon),
            is24h: e.tags['opening_hours'] === '24/7' || e.tags['opening_hours'] === 'Mo-Su 00:00-24:00',
            openHours: e.tags['opening_hours'] || undefined,
          };
        })
        .filter((f) => f.distance <= radiusKm);
    } catch (err: any) {
      this.logger.warn(`Overpass API failed: ${err.message} — falling back to DB only`);
      return [];
    }
  }

  private async queryDb(lat: number, lng: number, radiusKm: number, type?: string): Promise<NearbyFacility[]> {
    const where: any = { active: true };
    if (type) where.type = type;

    const facilities = await this.prisma.facility.findMany({
      where,
      select: {
        id: true, name: true, type: true, address: true, phone: true,
        lat: true, lng: true, openHours: true, is24h: true, rating: true, ratingCount: true,
      },
    });

    return facilities
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: String(f.type),
        address: f.address,
        phone: f.phone || undefined,
        lat: f.lat,
        lng: f.lng,
        openHours: f.openHours || undefined,
        is24h: f.is24h,
        distance: this.haversine(lat, lng, f.lat, f.lng),
      }))
      .filter((f) => f.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  private detectType(tags: any): string {
    if (tags.amenity === 'hospital') return 'HOSPITAL';
    if (tags.amenity === 'pharmacy') return 'PHARMACY';
    if (tags.amenity === 'clinic' || tags.amenity === 'doctors' || tags.amenity === 'dentist') return 'CLINIC';
    if (tags.healthcare === 'laboratory') return 'LABORATORY';
    return 'CLINIC';
  }

  private buildAddress(tags: any): string {
    const parts = [
      tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
      tags['addr:suburb'],
      tags['addr:city'],
    ].filter(Boolean);
    return parts.join(', ') || 'Endereço não disponível';
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}