import { Module, forwardRef } from '@nestjs/common';
import { TaxonomyAliasesService } from './taxonomy-aliases.service';
import { TaxonomyAliasesController } from './taxonomy-aliases.controller';
import { taxonomyAliasesProviders } from './taxonomy-aliases.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [TaxonomyAliasesController],
  providers: [...taxonomyAliasesProviders, TaxonomyAliasesService],
  exports: [TaxonomyAliasesService],
})
export class TaxonomyAliasesModule {}
