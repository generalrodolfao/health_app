import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './common/prisma.module';
import { HealthController } from './common/health.controller';
import { CheckupsModule } from './modules/checkups/checkups.module';
import { Nr1Module } from './modules/nr1/nr1.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    CheckupsModule,
    Nr1Module,
    FacilitiesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}