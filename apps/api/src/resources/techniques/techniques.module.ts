import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TechniquesService } from './techniques.service';
import { TechniquesController } from './techniques.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { techniquesProviders } from './techniques.providers';

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
  controllers: [TechniquesController],
  providers: [...techniquesProviders, TechniquesService],
  exports: [TechniquesService, ...techniquesProviders],
})
export class TechniquesModule {}
