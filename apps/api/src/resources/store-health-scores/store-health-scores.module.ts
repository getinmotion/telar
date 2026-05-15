import { Module, forwardRef } from '@nestjs/common';
import { StoreHealthScoresService } from './store-health-scores.service';
import { StoreHealthScoresController } from './store-health-scores.controller';
import { storeHealthScoresProviders } from './store-health-scores.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [StoreHealthScoresController],
  providers: [...storeHealthScoresProviders, StoreHealthScoresService],
  exports: [StoreHealthScoresService],
})
export class StoreHealthScoresModule {}
