import { Module } from '@nestjs/common';
import { TerritoriesService } from './territories.service';
import { TerritoriesController } from './territories.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { territoriesProviders } from './territories.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TerritoriesController],
  providers: [...territoriesProviders, TerritoriesService],
  exports: [TerritoriesService, ...territoriesProviders],
})
export class TerritoriesModule {}
