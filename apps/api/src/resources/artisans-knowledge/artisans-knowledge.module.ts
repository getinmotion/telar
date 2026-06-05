import { Module } from '@nestjs/common';
import { ArtisansKnowledgeService } from './artisans-knowledge.service';
import { ArtisansKnowledgeController } from './artisans-knowledge.controller';
import { artisansKnowledgeProviders } from './artisans-knowledge.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ArtisansKnowledgeController],
  providers: [...artisansKnowledgeProviders, ArtisansKnowledgeService],
  exports: [ArtisansKnowledgeService],
})
export class ArtisansKnowledgeModule {}
