import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServientregaService } from './servientrega.service';
import { ServientregaController } from './servientrega.controller';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [
    DatabaseModule, // Para acceso a DATA_SOURCE
    HttpModule, // Para llamadas HTTP a Servientrega API
  ],
  controllers: [ServientregaController],
  providers: [ServientregaService],
  exports: [ServientregaService],
})
export class ServientregaModule {}
