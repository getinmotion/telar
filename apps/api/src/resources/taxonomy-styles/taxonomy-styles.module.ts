import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TaxonomyStylesService } from './taxonomy-styles.service';
import { TaxonomyStylesController } from './taxonomy-styles.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { taxonomyStylesProviders } from './taxonomy-styles.providers';

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
  controllers: [TaxonomyStylesController],
  providers: [...taxonomyStylesProviders, TaxonomyStylesService],
  exports: [TaxonomyStylesService, ...taxonomyStylesProviders],
})
export class TaxonomyStylesModule {}
