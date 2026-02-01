import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';
import { UserMasterContextModule } from '../user-master-context/user-master-context.module';
import { ArtisanShopsModule } from '../artisan-shops/artisan-shops.module';
import { UserMaturityActionsModule } from '../user-maturity-actions/user-maturity-actions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailModule,
    forwardRef(() => UserProfilesModule),
    forwardRef(() => UserProgressModule),
    forwardRef(() => EmailVerificationsModule),
    forwardRef(() => UserMasterContextModule),
    forwardRef(() => ArtisanShopsModule),
    forwardRef(() => UserMaturityActionsModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PASSWORD_SECRET'),
        signOptions: { expiresIn: '4h' },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
