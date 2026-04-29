import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CmsSectionsController } from './cms-sections.controller';
import { CmsSectionsService } from './cms-sections.service';
import { CmsPage, CmsPageSchema } from './schemas/cms-page.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CmsPage.name, schema: CmsPageSchema },
    ]),
  ],
  controllers: [CmsSectionsController],
  providers: [CmsSectionsService],
  exports: [CmsSectionsService],
})
export class CmsSectionsModule {}
