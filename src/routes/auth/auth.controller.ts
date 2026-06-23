import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RequestInfo } from 'src/shared/decorators/user-agent.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
    @RequestInfo() { ipAddress, userAgent }: RequestInfo,
  ) {
    return this.authService.login(dto, ipAddress, userAgent);
  }
}
