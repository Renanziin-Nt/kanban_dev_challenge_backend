import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CardLogsService } from './card-logs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CardsController],
  providers: [CardsService, CardLogsService],
  exports: [CardsService, CardLogsService],
})
export class CardsModule {}