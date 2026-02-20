import { forwardRef, Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { wishlistProviders } from './wishlist.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [WishlistController],
  providers: [...wishlistProviders, WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
