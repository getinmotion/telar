import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MarketplaceAssignmentsService } from './marketplace-assignments.service';
import {
  CreateMarketplaceAssignmentDto,
  RemoveMarketplaceAssignmentDto,
} from './dto/create-marketplace-assignment.dto';
import { MarketplaceAssignment, MarketplaceKey } from './entities/marketplace-assignment.entity';

@ApiTags('marketplace-assignments')
@Controller('marketplace-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class MarketplaceAssignmentsController {
  constructor(private readonly service: MarketplaceAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Asignar producto a un marketplace' })
  @ApiResponse({ status: 201, type: MarketplaceAssignment })
  async assign(@Body() dto: CreateMarketplaceAssignmentDto): Promise<MarketplaceAssignment> {
    return this.service.assign(dto);
  }

  @Patch(':id/remove')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Remover producto de un marketplace (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, type: MarketplaceAssignment })
  async remove(
    @Param('id') id: string,
    @Body() dto: RemoveMarketplaceAssignmentDto,
  ): Promise<MarketplaceAssignment> {
    return this.service.remove(id, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Listar asignaciones activas' })
  @ApiQuery({ name: 'marketplace', required: false, enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'] })
  @ApiResponse({ status: 200, type: [MarketplaceAssignment] })
  async findAll(@Query('marketplace') marketplace?: MarketplaceKey): Promise<MarketplaceAssignment[]> {
    if (marketplace) return this.service.findByMarketplace(marketplace);
    return this.service.findAll();
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener marketplaces activos de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({ status: 200, type: [MarketplaceAssignment] })
  async findByProduct(@Param('productId') productId: string): Promise<MarketplaceAssignment[]> {
    return this.service.findByProduct(productId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, type: MarketplaceAssignment })
  async findOne(@Param('id') id: string): Promise<MarketplaceAssignment> {
    return this.service.findOne(id);
  }
}
