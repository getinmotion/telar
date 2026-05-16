import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreHealthScoresService } from './store-health-scores.service';
import { StoreHealthScore } from './entities/store-health-score.entity';

@ApiTags('store-health-scores')
@Controller('store-health-scores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class StoreHealthScoresController {
  constructor(private readonly service: StoreHealthScoresService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_product', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Listar todos los health scores de tiendas' })
  @ApiResponse({ status: 200, type: [StoreHealthScore] })
  async findAll(): Promise<StoreHealthScore[]> {
    return this.service.findAll();
  }

  @Get(':storeId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_product', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener health score de una tienda' })
  @ApiParam({ name: 'storeId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, type: StoreHealthScore })
  @ApiResponse({ status: 404, description: 'Score no encontrado' })
  async findOne(@Param('storeId') storeId: string): Promise<StoreHealthScore> {
    return this.service.findOne(storeId);
  }

  @Post(':storeId/compute')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_product', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Recalcular health score de una tienda' })
  @ApiParam({ name: 'storeId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, type: StoreHealthScore })
  async compute(
    @Param('storeId') storeId: string,
    @Body() storeData: Record<string, any>,
  ): Promise<StoreHealthScore> {
    return this.service.computeAndSave(storeId, storeData);
  }
}
