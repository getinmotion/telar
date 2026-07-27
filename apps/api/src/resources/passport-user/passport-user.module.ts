import { forwardRef, Module } from '@nestjs/common';
import { PassportUserService } from './passport-user.service';
import { PassportUserController } from './passport-user.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { passportUserProviders } from './passport-user.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [PassportUserController],
  providers: [...passportUserProviders, PassportUserService],
  exports: [PassportUserService, ...passportUserProviders],
})
export class PassportUserModule {}
