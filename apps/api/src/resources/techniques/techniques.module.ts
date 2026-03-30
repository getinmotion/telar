import { Module } from '@nestjs/common';
import { TechniquesService } from './techniques.service';
import { TechniquesController } from './techniques.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { techniquesProviders } from './techniques.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TechniquesController],
  providers: [...techniquesProviders, TechniquesService],
  exports: [TechniquesService, ...techniquesProviders],
})
export class TechniquesModule {}
