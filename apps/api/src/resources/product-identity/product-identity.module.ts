import { forwardRef, Module } from '@nestjs/common';
import { ProductIdentityService } from './product-identity.service';
import { ProductIdentityController } from './product-identity.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { productIdentityProviders } from './product-identity.providers';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), MailModule],
  controllers: [ProductIdentityController],
  providers: [...productIdentityProviders, ProductIdentityService],
  exports: [ProductIdentityService, ...productIdentityProviders],
})
export class ProductIdentityModule {}
