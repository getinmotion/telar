import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { storesProviders } from './stores.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [StoresController],
  providers: [...storesProviders, StoresService],
  exports: [StoresService, ...storesProviders],
})
export class StoresModule {}
