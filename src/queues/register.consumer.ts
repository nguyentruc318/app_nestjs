import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from 'src/shared/services/mail.service';
import { SendOtpJob } from 'src/shared/types/common';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendOtpJob>) {
    const { email, otp } = job.data;

    await this.mailService.sendOtp(email, otp);
  }
}
