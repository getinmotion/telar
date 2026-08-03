import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GestionService } from './gestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GestionFiltersDto } from './dto/gestion-filters.dto';
import { SANIDAD_CODES } from './gestion-sanidad.catalog';

/**
 * Capa de lectura del tablero. Todos los endpoints aceptan los MISMOS filtros
 * globales, para que el mismo corte dé el mismo número en cualquier pantalla.
 *
 * Antes este controller solo tenía JwtAuthGuard sin @Roles, es decir cualquier
 * usuario autenticado —incluido un artesano— podía leer la worklist completa
 * con los correos de los demás. Ahora exige rol de back office.
 */
@ApiTags('gestion')
@ApiBearerAuth()
// OJO: no incluir 'super_admin' en la lista. RolesGuard ya deja pasar a
// cualquier isSuperAdmin (roles.guard.ts:51), y si el rol aparece en @Roles()
// convierte la ruta en EXCLUSIVA de super_admin y rechaza a los admin
// (roles.guard.ts:56-58). Con la lista de abajo entran super_admin, admin y
// moderator, que es lo que queremos.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Controller('gestion')
export class GestionController {
  constructor(private readonly gestionService: GestionService) {}

  @Get('clientes-en-riesgo')
  @ApiOperation({
    summary:
      'Clientes en riesgo: worklist por tienda con score de riesgo, razones, métricas y geolocalización para el mapa.',
  })
  getClientesEnRiesgo(@Query() filters: GestionFiltersDto) {
    return this.gestionService.getClientesEnRiesgo(filters);
  }

  @Get('tiendas-salud')
  @ApiOperation({
    summary:
      'Salud de tiendas y tarjetas de estado del convenio: embudo de onboarding, conteos reales de producto, tiempo de aprobación, brechas y cortes por convenio/región/oficio.',
  })
  getTiendasSalud(@Query() filters: GestionFiltersDto) {
    return this.gestionService.getTiendasSalud(filters);
  }

  @Get('moderation-backlog')
  @ApiOperation({
    summary:
      'Backlog de moderación: pendientes actuales (productos + tiendas) con antigüedad, tiempo de resolución, throughput semanal y cortes por convenio.',
  })
  getModerationBacklog(@Query() filters: GestionFiltersDto) {
    return this.gestionService.getModerationBacklog(filters);
  }

  @Get('catalogo-composicion')
  @ApiOperation({
    summary:
      'Composición del catálogo: productos por estado, por categoría y por oficio, y estructura de precios (promedio, mínimo, máximo y distribución por rango). Es estructura de oferta, no desempeño comercial.',
  })
  getCatalogoComposicion(@Query() filters: GestionFiltersDto) {
    return this.gestionService.getCatalogoComposicion(filters);
  }

  @Get('sanidad-datos')
  @ApiOperation({
    summary:
      'Panel de sanidad de datos. Sin "issue" devuelve el resumen de todas las líneas con su propio denominador; con "issue" añade el listado nominal paginado para el drill-down y el CSV.',
  })
  @ApiQuery({
    name: 'issue',
    required: false,
    enum: SANIDAD_CODES,
    description: 'Código de la línea a detallar. Omítelo para el resumen.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSanidadDatos(
    @Query() filters: GestionFiltersDto,
    @Query('issue') issue?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gestionService.getSanidadDatos(
      filters,
      issue,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('catalogo-issue-products')
  @ApiOperation({
    summary:
      'Productos afectados por un issue de catálogo, con storeId para deep-link a Product Studio. Se mantiene por compatibilidad; el panel completo vive en /gestion/sanidad-datos.',
  })
  getCatalogoIssueProducts(
    @Query() filters: GestionFiltersDto,
    @Query('code') code: string,
    @Query('limit') limit?: string,
  ) {
    return this.gestionService.getCatalogoIssueProducts(
      code,
      limit ? parseInt(limit, 10) : 50,
      filters,
    );
  }
}
