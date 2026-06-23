import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtService } from './services/jwt.service';
import { HashingService } from './services/hash.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [HashingService, CustomJwtService],
  exports: [HashingService, CustomJwtService],
})
export class ShareModule {}
