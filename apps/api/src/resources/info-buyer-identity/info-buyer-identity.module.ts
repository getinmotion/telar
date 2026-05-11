import { Module } from '@nestjs/common';
import { InfoBuyerIdentityService } from './info-buyer-identity.service';
import { InfoBuyerIdentityController } from './info-buyer-identity.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { infoBuyerIdentityProviders } from './info-buyer-identity.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [InfoBuyerIdentityController],
  providers: [...infoBuyerIdentityProviders, InfoBuyerIdentityService],
  exports: [InfoBuyerIdentityService, ...infoBuyerIdentityProviders],
})
export class InfoBuyerIdentityModule {}
