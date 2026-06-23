import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../../shared/entities/user.entity';
import { UserSession } from '../../shared/entities/user-sessions.entity';
import { RefreshTokenEntity } from '../../shared/entities/refresh-token.entity';
import { ShareModule } from 'src/shared/share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, RefreshTokenEntity]),
    ShareModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
