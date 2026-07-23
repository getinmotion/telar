import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConfigMongoModule } from '../../config/mongo/configMongo.module';
import { CmsSectionsModule } from '../cms-sections/cms-sections.module';
import { CmsTerritoriesController } from './cms-territories.controller';
import { CmsTerritoriesService } from './cms-territories.service';
import { cmsTerritoriesProviders } from './cms-territories.providers';

/**
 * Mantiene CmsSectionsModule para acceder a CmsSeedSkipsService.
 * La conexión Mongo viene de ConfigMongoModule.
 */
@Module({
  imports: [forwardRef(() => AuthModule), ConfigMongoModule, CmsSectionsModule],
  controllers: [CmsTerritoriesController],
  providers: [...cmsTerritoriesProviders, CmsTerritoriesService],
  exports: [CmsTerritoriesService],
})
export class CmsTerritoriesModule {}
