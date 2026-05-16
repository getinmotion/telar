import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ArtisanMaestrosService } from './artisan-maestros.service';
import { ArtisanMaestrosController } from './artisan-maestros.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { artisanMaestrosProviders } from './artisan-maestros.providers';

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
  controllers: [ArtisanMaestrosController],
  providers: [...artisanMaestrosProviders, ArtisanMaestrosService],
  exports: [ArtisanMaestrosService],
})
export class ArtisanMaestrosModule {}
