import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
  ): Promise<string> {
    const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRE ?? '30m';
    return this.jwtService.signAsync(
      { id: uuidv4(), ...payload } as Record<string, any>,
      {
        secret: process.env.JWT_SECRET!,
        expiresIn: accessTokenExpire as JwtSignOptions['expiresIn'],
      },
    );
  }

  async generateRefreshToken(
    payload: RefreshTokenPayloadCreate,
  ): Promise<string> {
    const refreshTokenExpire = process.env.REFRESH_TOKEN_EXPIRE ?? '7d';
    return this.jwtService.signAsync(
      { id: uuidv4(), ...payload } as Record<string, any>,
      {
        secret: process.env.JWT_SECRET!,
        expiresIn: refreshTokenExpire as JwtSignOptions['expiresIn'],
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
