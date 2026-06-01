import { Module } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { AgreementsController } from './agreements.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { agreementsProviders } from './agreements.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AgreementsController],
  providers: [...agreementsProviders, AgreementsService],
  exports: [AgreementsService, ...agreementsProviders],
})
export class AgreementsModule {}
