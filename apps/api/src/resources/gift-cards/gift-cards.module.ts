import { forwardRef, Module } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { giftCardsProviders } from './gift-cards.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [GiftCardsController],
  providers: [...giftCardsProviders, GiftCardsService],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}
