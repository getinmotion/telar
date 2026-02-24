import { Module, forwardRef } from '@nestjs/common';
import { BrandThemesService } from './brand-themes.service';
import { BrandThemesController } from './brand-themes.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { brandThemesProviders } from './brand-themes.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [BrandThemesController],
  providers: [...brandThemesProviders, BrandThemesService],
  exports: [BrandThemesService, ...brandThemesProviders],
})
export class BrandThemesModule {}
