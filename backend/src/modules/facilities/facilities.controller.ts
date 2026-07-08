import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import { FacilityType } from '@prisma/client';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar unidades próximas' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: FacilityType })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('type') type?: FacilityType,
  ) {
    return this.facilitiesService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5,
      type,
    );
  }

  @Get('emergency')
  @ApiOperation({ summary: 'Hospital mais próximo (emergência)' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  async emergency(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.facilitiesService.getEmergencyHospital(parseFloat(lat), parseFloat(lng));
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar unidades por nome/endereço' })
  async search(@Query('q') query: string) {
    return this.facilitiesService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da unidade' })
  async findOne(@Param('id') id: string) {
    return this.facilitiesService.findById(id);
  }
}
