import { Module } from '@nestjs/common';
import { CraftsService } from './crafts.service';
import { CraftsController } from './crafts.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { craftsProviders } from './crafts.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CraftsController],
  providers: [...craftsProviders, CraftsService],
  exports: [CraftsService, ...craftsProviders],
})
export class CraftsModule {}
