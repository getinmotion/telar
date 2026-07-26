import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GestionService } from './gestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gestion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gestion')
export class GestionController {
  constructor(private readonly gestionService: GestionService) {}

  @Get('clientes-en-riesgo')
  @ApiOperation({
    summary:
      'Clientes en riesgo: worklist por tienda con score de riesgo, razones y métricas (config/perfil/cobre/catálogo/moderación).',
  })
  getClientesEnRiesgo() {
    return this.gestionService.getClientesEnRiesgo();
  }

  @Get('tiendas-salud')
  @ApiOperation({
    summary:
      'Salud de tiendas: embudo de onboarding con conteos reales de producto, tiempo de aprobación, brechas y cortes por convenio/región/oficio.',
  })
  getTiendasSalud() {
    return this.gestionService.getTiendasSalud();
  }

  @Get('moderation-backlog')
  @ApiOperation({
    summary:
      'Backlog de moderación: pendientes actuales (productos + tiendas) con antigüedad, tiempo de resolución, throughput semanal y cortes por convenio.',
  })
  getModerationBacklog() {
    return this.gestionService.getModerationBacklog();
  }

  @Get('catalogo-issue-products')
  @ApiOperation({
    summary:
      'Productos afectados por un issue de catálogo (drill-down de la cola de detección de Productos), con storeId para deep-link a Product Studio.',
  })
  getCatalogoIssueProducts(
    @Query('code') code: string,
    @Query('limit') limit?: string,
  ) {
    return this.gestionService.getCatalogoIssueProducts(
      code,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
