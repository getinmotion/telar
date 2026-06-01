import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CraftsService } from './crafts.service';
import { CraftsController } from './crafts.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { craftsProviders } from './crafts.providers';

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
  controllers: [CraftsController],
  providers: [...craftsProviders, CraftsService],
  exports: [CraftsService, ...craftsProviders],
})
export class CraftsModule {}
