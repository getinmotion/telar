import { forwardRef, Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { addressesProviders } from './addresses.providers';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [AddressesController],
  providers: [...addressesProviders, AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
