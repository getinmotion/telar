import { Module } from '@nestjs/common';
import { IdTypeUserService } from './id-type-user.service';
import { IdTypeUserController } from './id-type-user.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { idTypeUserProviders } from './id-type-user.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [IdTypeUserController],
  providers: [...idTypeUserProviders, IdTypeUserService],
  exports: [IdTypeUserService, ...idTypeUserProviders],
})
export class IdTypeUserModule {}
