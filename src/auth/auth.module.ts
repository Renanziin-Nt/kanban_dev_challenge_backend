import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { ClerkService } from './clerk.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard, ClerkService],
  exports: [AuthGuard, ClerkService],
})
export class AuthModule {}