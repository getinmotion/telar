import { forwardRef, Module } from '@nestjs/common';
import { UsersPassportService } from './users-passport.service';
import { UsersPassportController } from './users-passport.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { usersPassportProviders } from './users-passport.providers';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), MailModule],
  controllers: [UsersPassportController],
  providers: [...usersPassportProviders, UsersPassportService],
  exports: [UsersPassportService, ...usersPassportProviders],
})
export class UsersPassportModule {}
