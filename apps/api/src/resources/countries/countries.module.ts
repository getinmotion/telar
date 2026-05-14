import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { countriesProviders } from './countries.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CountriesController],
  providers: [...countriesProviders, CountriesService],
  exports: [CountriesService, ...countriesProviders],
})
export class CountriesModule {}
