import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CobreService } from './cobre.service';
import { CobreController } from './cobre.controller';
import { ArtisanShopsModule } from '../artisan-shops/artisan-shops.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, ConfigModule, ArtisanShopsModule, forwardRef(() => AuthModule)],
  controllers: [CobreController],
  providers: [CobreService],
  exports: [CobreService],
})
export class CobreModule {}
