import {
  Controller,
  Get,
  Post,
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
import { TaxonomyAliasesService } from './taxonomy-aliases.service';
import { CreateTaxonomyAliasDto } from './dto/create-taxonomy-alias.dto';
import { TaxonomyAlias, TaxonomyAliasType } from './entities/taxonomy-alias.entity';

@ApiTags('taxonomy-aliases')
@Controller('taxonomy-aliases')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TaxonomyAliasesController {
  constructor(private readonly service: TaxonomyAliasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('moderator', 'admin', 'moderator_taxonomy', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Crear alias de taxonomía (fusión o nombre alternativo)' })
  @ApiResponse({ status: 201, type: TaxonomyAlias })
  async create(@Body() dto: CreateTaxonomyAliasDto): Promise<TaxonomyAlias> {
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_taxonomy', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Listar todos los aliases' })
  @ApiQuery({ name: 'type', required: false, enum: ['material', 'craft', 'technique', 'style'] })
  @ApiResponse({ status: 200, type: [TaxonomyAlias] })
  async findAll(@Query('type') type?: TaxonomyAliasType): Promise<TaxonomyAlias[]> {
    if (type) return this.service.findByType(type);
    return this.service.findAll();
  }

  @Get('canonical/:canonicalId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_taxonomy', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener aliases de un término canónico' })
  @ApiParam({ name: 'canonicalId', description: 'ID del término canónico' })
  @ApiResponse({ status: 200, type: [TaxonomyAlias] })
  async findByCanonical(@Param('canonicalId') canonicalId: string): Promise<TaxonomyAlias[]> {
    return this.service.findByCanonicalId(canonicalId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin', 'moderator_taxonomy', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Obtener alias por ID' })
  @ApiParam({ name: 'id', description: 'ID del alias' })
  @ApiResponse({ status: 200, type: TaxonomyAlias })
  async findOne(@Param('id') id: string): Promise<TaxonomyAlias> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'supervisor', 'admin_global')
  @ApiOperation({ summary: 'Eliminar alias' })
  @ApiParam({ name: 'id', description: 'ID del alias' })
  @ApiResponse({ status: 204, description: 'Alias eliminado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
