import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ClerkService } from './clerk.service';

@Module({
  providers: [AuthGuard, ClerkService],
  exports: [AuthGuard, ClerkService],
})
export class AuthModule {}