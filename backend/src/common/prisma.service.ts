import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _isConnected = false;

  get isConnected() {
    return this._isConnected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this._isConnected = true;
      this.logger.log('✓ Connected to database');
    } catch (err) {
      this.logger.warn(`⚠ Database connection failed: ${err.message}`);
      this.logger.warn('App will start anyway, health will report "degraded"');
    }
  }

  async onModuleDestroy() {
    if (this._isConnected) {
      try { await this.$disconnect(); } catch {}
    }
  }
}