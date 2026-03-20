import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServientregaService } from './servientrega.service';
import { ServientregaController } from './servientrega.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { servientregaProviders } from './servientrega.providers';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    DatabaseModule, // Para acceso a DATA_SOURCE
    HttpModule, // Para llamadas HTTP a Servientrega API
    MailModule, // Para envío de emails
  ],
  controllers: [ServientregaController],
  providers: [ServientregaService, ...servientregaProviders],
  exports: [ServientregaService],
})
export class ServientregaModule {}
