import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/config/configOrm.module';
import { PayoutUserInfoService } from './payout-user-info.service';
import { PayoutUserInfoController } from './payout-user-info.controller';
import { payoutUserInfoProviders } from './payout-user-info.providers';
import { EncryptionService } from 'src/common/services/encryption.service';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { ArtisanShopsModule } from '../artisan-shops/artisan-shops.module';

@Module({
  imports: [DatabaseModule, ConfigModule, UserProfilesModule, ArtisanShopsModule],
  controllers: [PayoutUserInfoController],
  providers: [
    PayoutUserInfoService,
    EncryptionService,
    ...payoutUserInfoProviders,
  ],
  exports: [PayoutUserInfoService, ...payoutUserInfoProviders],
})
export class PayoutUserInfoModule {}
