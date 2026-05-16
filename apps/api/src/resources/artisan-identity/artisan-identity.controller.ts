import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ArtisanIdentityService } from './artisan-identity.service';
import { CreateArtisanIdentityDto } from './dto/create-artisan-identity.dto';
import { UpdateArtisanIdentityDto } from './dto/update-artisan-identity.dto';
import { ArtisanIdentity } from './entities/artisan-identity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Artisan Identity')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('artisan-identity')
export class ArtisanIdentityController {
  constructor(
    private readonly artisanIdentityService: ArtisanIdentityService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de identidad artesanal' })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: ArtisanIdentity,
  })
  create(
    @CurrentUser() user: { sub: string; isSuperAdmin?: boolean },
    @Body() createArtisanIdentityDto: CreateArtisanIdentityDto,
  ) {
    return this.artisanIdentityService.create(createArtisanIdentityDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los registros de identidad artesanal',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros obtenida exitosamente',
    type: [ArtisanIdentity],
  })
  findAll(@CurrentUser() user: { sub: string; isSuperAdmin?: boolean }) {
    if (!user.isSuperAdmin) throw new ForbiddenException();
    return this.artisanIdentityService.findAll();
  }

  /**
   * GET /artisan-identity/user/:userId
   * Obtener artisan identity del usuario (para pre-cargar en wizard de productos)
   */
  @Get('user/:userId')
  findByUserId(
    @CurrentUser() user: { sub: string; isSuperAdmin?: boolean },
    @Param('userId') userId: string,
  ) {
    if (!user.isSuperAdmin && user.sub !== userId) throw new ForbiddenException();
    return this.artisanIdentityService.findByUserId(userId);
  }

  /**
   * PATCH /artisan-identity/user/:userId
   * Actualizar técnicas primaria y/o secundaria del artesano
   */
  @Patch('user/:userId')
  updateTechniquesByUserId(
    @CurrentUser() user: { sub: string; isSuperAdmin?: boolean },
    @Param('userId') userId: string,
    @Body() body: { techniquePrimaryId?: string | null; techniqueSecondaryId?: string | null },
  ) {
    if (!user.isSuperAdmin && user.sub !== userId) throw new ForbiddenException();
    return this.artisanIdentityService.updateTechniquesByUserId(userId, body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un registro de identidad artesanal por ID',
  })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: ArtisanIdentity,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.artisanIdentityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de identidad artesanal' })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    type: ArtisanIdentity,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateArtisanIdentityDto: UpdateArtisanIdentityDto,
  ) {
    return this.artisanIdentityService.update(id, updateArtisanIdentityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de identidad artesanal' })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  remove(
    @CurrentUser() user: { sub: string; isSuperAdmin?: boolean },
    @Param('id') id: string,
  ) {
    if (!user.isSuperAdmin) throw new ForbiddenException();
    return this.artisanIdentityService.remove(id);
  }
}
