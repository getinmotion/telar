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
import { ArtisanMaterialsService } from './artisan-materials.service';
import { CreateArtisanMaterialDto } from './dto/create-artisan-material.dto';
import { UpdateArtisanMaterialDto } from './dto/update-artisan-material.dto';
import { ArtisanMaterial } from './entities/artisan-material.entity';

@ApiTags('Artisan Materials')
@Controller('artisan-materials')
export class ArtisanMaterialsController {
  constructor(
    private readonly artisanMaterialsService: ArtisanMaterialsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva relación artesano-material' })
  @ApiResponse({
    status: 201,
    description: 'Relación creada exitosamente',
    type: ArtisanMaterial,
  })
  @ApiResponse({
    status: 409,
    description: 'La relación ya existe',
  })
  create(@Body() createArtisanMaterialDto: CreateArtisanMaterialDto) {
    return this.artisanMaterialsService.create(createArtisanMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las relaciones artesano-material' })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones obtenida exitosamente',
    type: [ArtisanMaterial],
  })
  findAll() {
    return this.artisanMaterialsService.findAll();
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener todos los materiales de un artesano' })
  @ApiParam({
    name: 'artisanId',
    description: 'ID del artesano',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de materiales del artesano',
    type: [ArtisanMaterial],
  })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.artisanMaterialsService.findByArtisan(artisanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una relación artesano-material por ID' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Relación encontrada',
    type: ArtisanMaterial,
  })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.artisanMaterialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una relación artesano-material' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Relación actualizada exitosamente',
    type: ArtisanMaterial,
  })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateArtisanMaterialDto: UpdateArtisanMaterialDto,
  ) {
    return this.artisanMaterialsService.update(id, updateArtisanMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una relación artesano-material' })
  @ApiParam({ name: 'id', description: 'ID de la relación', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Relación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  remove(@Param('id') id: string) {
    return this.artisanMaterialsService.remove(id);
  }
}
