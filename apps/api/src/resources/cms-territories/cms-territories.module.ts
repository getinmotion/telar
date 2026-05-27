import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CmsSectionsModule } from '../cms-sections/cms-sections.module';
import { CmsTerritoriesController } from './cms-territories.controller';
import { CmsTerritoriesService } from './cms-territories.service';
import { cmsTerritoriesProviders } from './cms-territories.providers';

/**
 * Reusa CmsSectionsModule para tomar el provider MONGO_DATA_SOURCE y el
 * CmsSeedSkipsService (para que las deletions hechas desde el admin no se
 * re-creen en el siguiente seed).
 */
@Module({
  imports: [forwardRef(() => AuthModule), CmsSectionsModule],
  controllers: [CmsTerritoriesController],
  providers: [...cmsTerritoriesProviders, CmsTerritoriesService],
  exports: [CmsTerritoriesService],
})
export class CmsTerritoriesModule {}
