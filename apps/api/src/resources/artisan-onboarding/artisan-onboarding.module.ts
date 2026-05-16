import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/config/configOrm.module';
import { ArtisanOnboardingService } from './artisan-onboarding.service';
import { ArtisanOnboardingController } from './artisan-onboarding.controller';
import { artisanOnboardingProviders } from './artisan-onboarding.providers';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PASSWORD_SECRET'),
        signOptions: { expiresIn: '4h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ArtisanOnboardingController],
  providers: [...artisanOnboardingProviders, ArtisanOnboardingService],
  exports: [ArtisanOnboardingService],
})
export class ArtisanOnboardingModule {}
