import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';
import { Public } from './public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    if (!this.prisma.isConnected) {
      return { status: 'degraded', timestamp: new Date().toISOString(), db: 'disconnected' };
    }
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', timestamp: new Date().toISOString(), db: 'connected' };
    } catch {
      return { status: 'degraded', timestamp: new Date().toISOString(), db: 'error' };
    }
  }
}