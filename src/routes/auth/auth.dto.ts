import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export class LoginDto extends createZodDto(LoginSchema) {}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
