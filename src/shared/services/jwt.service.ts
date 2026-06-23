import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  AccessTokenPayloadCreate,
  RefreshTokenPayloadCreate,
} from '../types/jwt';

@Injectable()
export class CustomJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(
    payload: AccessTokenPayloadCreate,
    options?: JwtModuleOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { id: uuidv4(), ...payload },
      {
        secret: process.env.JWT_SECRET!,
        expiresIn: options?.signOptions?.expiresIn || '30m',
      },
    );
  }

  async generateRefreshToken(
    payload: RefreshTokenPayloadCreate,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { id: uuidv4(), ...payload },
      {
        secret: process.env.JWT_SECRET!,
        expiresIn: '30d',
      },
    );
  }

  async generateTokens({ userId, deviceId }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken({
        userId,
        deviceId,
      }),
      this.generateRefreshToken({
        userId,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  verifyAccessToken<T = any>(token: string): T {
    try {
      return this.jwtService.verify(token) as T;
    } catch (error: any) {
      throw new UnauthorizedException(error);
    }
  }
  decodeAccessToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
