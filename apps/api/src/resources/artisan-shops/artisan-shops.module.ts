import { Module, forwardRef } from '@nestjs/common';
import { ArtisanShopsService } from './artisan-shops.service';
import { ArtisanShopsController } from './artisan-shops.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanShopsProviders } from './artisan-shops.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [ArtisanShopsController],
  providers: [...artisanShopsProviders, ArtisanShopsService],
  exports: [ArtisanShopsService, ...artisanShopsProviders],
})
export class ArtisanShopsModule {}
