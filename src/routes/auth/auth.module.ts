import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../../shared/entities/user.entity';
import { UserSession } from '../../shared/entities/user-sessions.entity';
import { RefreshTokenEntity } from '../../shared/entities/refresh-token.entity';
import { ShareModule } from 'src/shared/share.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from 'src/queues/register.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, RefreshTokenEntity]),
    BullModule.registerQueue({
      name: 'email',
    }),
    ShareModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailProcessor],
  exports: [AuthService],
})
export class AuthModule {}
