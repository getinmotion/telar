import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersIdAgreementService } from './users-id-agreement.service';
import { UsersIdAgreementController } from './users-id-agreement.controller';
import { usersIdAgreementProviders } from './users-id-agreement.providers';
import { IdTypeUserModule } from '../id-type-user/id-type-user.module';
import { AgreementsModule } from '../agreements/agreements.module';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule, ConfigModule, IdTypeUserModule, AgreementsModule],
  controllers: [UsersIdAgreementController],
  providers: [...usersIdAgreementProviders, UsersIdAgreementService],
  exports: [UsersIdAgreementService],
})
export class UsersIdAgreementModule {}
