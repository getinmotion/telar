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
import { ShopModerationHistoryService } from './shop-moderation-history.service';
import { CreateShopModerationHistoryDto } from './dto/create-shop-moderation-history.dto';
import { ShopModerationHistory } from './entities/shop-moderation-history.entity';

/**
 * Historial de moderación de tiendas — append-only (sin PATCH ni DELETE).
 */
@ApiTags('shop-moderation-history')
@Controller('shop-moderation-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ShopModerationHistoryController {
  constructor(
    private readonly shopModerationHistoryService: ShopModerationHistoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Crear registro de historial de moderación de tienda' })
  @ApiResponse({ status: 201, type: ShopModerationHistory })
  async create(
    @Body() createDto: CreateShopModerationHistoryDto,
  ): Promise<ShopModerationHistory> {
    return this.shopModerationHistoryService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Obtener todos los registros de historial de tiendas' })
  @ApiResponse({ status: 200, type: [ShopModerationHistory] })
  async findAll(): Promise<ShopModerationHistory[]> {
    return this.shopModerationHistoryService.findAll();
  }

  @Get('shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Obtener historial de moderación de una tienda' })
  @ApiParam({ name: 'shopId', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, type: [ShopModerationHistory] })
  async findByShopId(
    @Param('shopId') shopId: string,
  ): Promise<ShopModerationHistory[]> {
    return this.shopModerationHistoryService.findByShopId(shopId);
  }

  @Get('moderator/:moderatorId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Obtener historial de moderación por moderador' })
  @ApiParam({ name: 'moderatorId', description: 'ID del moderador' })
  @ApiResponse({ status: 200, type: [ShopModerationHistory] })
  async findByModeratorId(
    @Param('moderatorId') moderatorId: string,
  ): Promise<ShopModerationHistory[]> {
    return this.shopModerationHistoryService.findByModeratorId(moderatorId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro' })
  @ApiResponse({ status: 200, type: ShopModerationHistory })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  async findOne(@Param('id') id: string): Promise<ShopModerationHistory> {
    return this.shopModerationHistoryService.findOne(id);
  }
}
