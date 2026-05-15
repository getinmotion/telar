import { Module, forwardRef } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
  exports: [AdminStatsService],
})
export class AdminStatsModule {}
