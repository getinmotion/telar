import { Module } from '@nestjs/common';
import { ArtisansKnowledgeService } from './artisans-knowledge.service';
import { ArtisansKnowledgeController } from './artisans-knowledge.controller';
import { artisansKnowledgeProviders } from './artisans-knowledge.providers';
import { ArtisansKnowledgeSyncService } from './artisans-knowledge-sync.service';
import { artisanOnboardingProviders } from '../artisan-onboarding/artisan-onboarding.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisansKnowledgeController],
  providers: [
    ...artisansKnowledgeProviders,
    ...artisanOnboardingProviders,
    ArtisansKnowledgeService,
    ArtisansKnowledgeSyncService,
  ],
  exports: [ArtisansKnowledgeService, ArtisansKnowledgeSyncService],
})
export class ArtisansKnowledgeModule {}
