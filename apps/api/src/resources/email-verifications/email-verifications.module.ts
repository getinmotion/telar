import { Module, forwardRef } from '@nestjs/common';
import { EmailVerificationsService } from './email-verifications.service';
import { EmailVerificationsController } from './email-verifications.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { emailVerificationsProviders } from './email-verifications.providers';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EmailVerificationsController],
  providers: [...emailVerificationsProviders, EmailVerificationsService],
  exports: [EmailVerificationsService, ...emailVerificationsProviders],
})
export class EmailVerificationsModule {}
