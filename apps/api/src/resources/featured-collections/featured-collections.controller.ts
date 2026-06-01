import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { FeaturedCollectionsService } from './featured-collections.service';
import {
  CreateFeaturedCollectionDto,
  UpdateFeaturedCollectionDto,
} from './dto/create-featured-collection.dto';
import { FeaturedCollection } from './entities/featured-collection.entity';
import { MarketplaceKey } from '../marketplace-assignments/entities/marketplace-assignment.entity';

@ApiTags('featured-collections')
@Controller('featured-collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class FeaturedCollectionsController {
  constructor(private readonly service: FeaturedCollectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Crear colección curada' })
  @ApiResponse({ status: 201, type: FeaturedCollection })
  async create(@Body() dto: CreateFeaturedCollectionDto): Promise<FeaturedCollection> {
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Listar colecciones curadas' })
  @ApiQuery({ name: 'marketplace', required: false, enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'] })
  @ApiResponse({ status: 200, type: [FeaturedCollection] })
  async findAll(@Query('marketplace') marketplace?: MarketplaceKey): Promise<FeaturedCollection[]> {
    return this.service.findAll(marketplace);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener colección por ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: FeaturedCollection })
  async findOne(@Param('id') id: string): Promise<FeaturedCollection> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'curator_marketplace', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Actualizar colección (incluye reordenar productos)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: FeaturedCollection })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFeaturedCollectionDto,
  ): Promise<FeaturedCollection> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Eliminar colección curada' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
