import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ArtisanMediaFamilyService } from './artisan-media-family.service';
import { CreateArtisanMediaFamilyDto } from './dto/create-artisan-media-family.dto';
import { UpdateArtisanMediaFamilyDto } from './dto/update-artisan-media-family.dto';
import { ArtisanMediaFamily } from './entities/artisan-media-family.entity';

@ApiTags('Artisan Media Family')
@Controller('artisan-media-family')
export class ArtisanMediaFamilyController {
  constructor(
    private readonly artisanMediaFamilyService: ArtisanMediaFamilyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo medio familiar del artesano' })
  @ApiResponse({
    status: 201,
    description: 'Medio creado exitosamente',
    type: ArtisanMediaFamily,
  })
  create(@Body() createArtisanMediaFamilyDto: CreateArtisanMediaFamilyDto) {
    return this.artisanMediaFamilyService.create(createArtisanMediaFamilyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los medios familiares' })
  @ApiResponse({
    status: 200,
    description: 'Lista de medios obtenida exitosamente',
    type: [ArtisanMediaFamily],
  })
  findAll() {
    return this.artisanMediaFamilyService.findAll();
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener todos los medios familiares de un artesano' })
  @ApiParam({
    name: 'artisanId',
    description: 'ID del artesano',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de medios familiares del artesano',
    type: [ArtisanMediaFamily],
  })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.artisanMediaFamilyService.findByArtisan(artisanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medio familiar por ID' })
  @ApiParam({ name: 'id', description: 'ID del medio', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Medio encontrado',
    type: ArtisanMediaFamily,
  })
  @ApiResponse({ status: 404, description: 'Medio no encontrado' })
  findOne(@Param('id') id: string) {
    return this.artisanMediaFamilyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medio familiar' })
  @ApiParam({ name: 'id', description: 'ID del medio', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Medio actualizado exitosamente',
    type: ArtisanMediaFamily,
  })
  @ApiResponse({ status: 404, description: 'Medio no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateArtisanMediaFamilyDto: UpdateArtisanMediaFamilyDto,
  ) {
    return this.artisanMediaFamilyService.update(id, updateArtisanMediaFamilyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un medio familiar' })
  @ApiParam({ name: 'id', description: 'ID del medio', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Medio eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Medio no encontrado' })
  remove(@Param('id') id: string) {
    return this.artisanMediaFamilyService.remove(id);
  }
}
