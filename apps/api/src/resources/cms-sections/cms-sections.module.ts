import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CmsSectionsController } from './cms-sections.controller';
import { CmsSectionsService } from './cms-sections.service';
import { cmsSectionsProviders } from './cms-sections.providers';

@Module({
  imports: [AuthModule],
  controllers: [CmsSectionsController],
  providers: [...cmsSectionsProviders, CmsSectionsService],
  exports: [CmsSectionsService, ...cmsSectionsProviders],
})
export class CmsSectionsModule {}
