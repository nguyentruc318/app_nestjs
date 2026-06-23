import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { UserSession } from '../../shared/entities/user-sessions.entity';
import { RefreshTokenEntity } from '../../shared/entities/refresh-token.entity';
import { LoginDto, LoginResponse } from './auth.dto';
import { CustomJwtService } from 'src/shared/services/jwt.service';
import { HashingService } from 'src/shared/services/hash.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,

    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,

    private readonly customJwtService: CustomJwtService,
    private readonly HashingService: HashingService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await this.HashingService.comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const session = this.sessionRepo.create({
      user,
      ipAddress,
      userAgent,
      isActive: true,
    });
    const savedSession = await this.sessionRepo.save(session);

    const { accessToken, refreshToken } =
      await this.customJwtService.generateTokens({
        userId: user.id,
        deviceId: savedSession.id,
      });
    const refreshTokenEntity = this.refreshTokenRepo.create({
      user,
      session: savedSession,
      tokenHash: refreshToken,
    });
    await this.refreshTokenRepo.save(refreshTokenEntity);
    return {
      accessToken,
      refreshToken,
    };
  }
}
