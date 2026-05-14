import { Module } from '@nestjs/common';
import { ArtisanMediaCommunityService } from './artisan-media-community.service';
import { ArtisanMediaCommunityController } from './artisan-media-community.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMediaCommunityProviders } from './artisan-media-community.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanMediaCommunityController],
  providers: [...artisanMediaCommunityProviders, ArtisanMediaCommunityService],
  exports: [ArtisanMediaCommunityService],
})
export class ArtisanMediaCommunityModule {}
