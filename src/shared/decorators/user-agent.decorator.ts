import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
}

export const RequestInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestInfo => {
    const req = ctx.switchToHttp().getRequest<Request>();

    return {
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };
  },
);
