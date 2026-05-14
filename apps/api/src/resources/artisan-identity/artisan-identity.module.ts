import { Module } from '@nestjs/common';
import { ArtisanIdentityService } from './artisan-identity.service';
import { ArtisanIdentityController } from './artisan-identity.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanIdentityProviders } from './artisan-identity.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisanIdentityController],
  providers: [...artisanIdentityProviders, ArtisanIdentityService],
  exports: [ArtisanIdentityService],
})
export class ArtisanIdentityModule {}
