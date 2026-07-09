import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma.module';
import { HealthController } from './common/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CheckupsModule } from './modules/checkups/checkups.module';
import { Nr1Module } from './modules/nr1/nr1.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CheckupsModule,
    Nr1Module,
    FacilitiesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}