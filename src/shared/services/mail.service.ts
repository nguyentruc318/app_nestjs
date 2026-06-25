import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendOtp(email: string, otp: string) {
    return this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your account',
      html: `<h1>Your OTP is ${otp}</h1>`,
    });
  }
}
