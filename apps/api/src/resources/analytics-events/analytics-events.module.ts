import { Module } from '@nestjs/common';
import { AnalyticsEventsService } from './analytics-events.service';
import { AnalyticsEventsController } from './analytics-events.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { analyticsEventsProviders } from './analytics-events.providers';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  controllers: [AnalyticsEventsController],
  providers: [...analyticsEventsProviders, AnalyticsEventsService],
  exports: [AnalyticsEventsService, ...analyticsEventsProviders],
})
export class AnalyticsEventsModule {}
