import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';

/**
 * Módulo global para el servicio de S3
 *
 * Se marca como @Global para que esté disponible en toda la aplicación
 * sin necesidad de importarlo en cada módulo.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
