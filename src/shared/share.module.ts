import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtService } from './services/jwt.service';
import { HashingService } from './services/hash.service';
import { MailService } from './services/mail.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [HashingService, CustomJwtService, MailService],
  exports: [HashingService, CustomJwtService, MailService],
})
export class ShareModule {}
