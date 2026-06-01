import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TaxonomyHerramientasService } from './taxonomy-herramientas.service';
import { TaxonomyHerramientasController } from './taxonomy-herramientas.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { taxonomyHerramientasProviders } from './taxonomy-herramientas.providers';

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
  controllers: [TaxonomyHerramientasController],
  providers: [...taxonomyHerramientasProviders, TaxonomyHerramientasService],
  exports: [TaxonomyHerramientasService, ...taxonomyHerramientasProviders],
})
export class TaxonomyHerramientasModule {}
