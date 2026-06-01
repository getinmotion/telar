import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { materialsProviders } from './materials.providers';

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
  controllers: [MaterialsController],
  providers: [...materialsProviders, MaterialsService],
  exports: [MaterialsService, ...materialsProviders],
})
export class MaterialsModule {}
