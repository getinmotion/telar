import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanProfileHistoryProviders } from './artisan-profile-history.providers';
import { ArtisanProfileHistoryDbService } from './artisan-profile-history.service';

@Module({
  imports: [DatabaseModule],
  providers: [...artisanProfileHistoryProviders, ArtisanProfileHistoryDbService],
  exports: [ArtisanProfileHistoryDbService, ...artisanProfileHistoryProviders],
})
export class ArtisanProfileHistoryModule {}
