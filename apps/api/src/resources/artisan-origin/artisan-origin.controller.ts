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
import { ArtisanOriginService } from './artisan-origin.service';
import { CreateArtisanOriginDto } from './dto/create-artisan-origin.dto';
import { UpdateArtisanOriginDto } from './dto/update-artisan-origin.dto';
import { ArtisanOrigin } from './entities/artisan-origin.entity';

@ApiTags('Artisan Origin')
@Controller('artisan-origin')
export class ArtisanOriginController {
  constructor(private readonly artisanOriginService: ArtisanOriginService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de origen artesanal' })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: ArtisanOrigin,
  })
  create(@Body() createArtisanOriginDto: CreateArtisanOriginDto) {
    return this.artisanOriginService.create(createArtisanOriginDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de origen artesanal' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros obtenida exitosamente',
    type: [ArtisanOrigin],
  })
  findAll() {
    return this.artisanOriginService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de origen artesanal por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: ArtisanOrigin,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.artisanOriginService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de origen artesanal' })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    type: ArtisanOrigin,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateArtisanOriginDto: UpdateArtisanOriginDto,
  ) {
    return this.artisanOriginService.update(id, updateArtisanOriginDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de origen artesanal' })
  @ApiParam({ name: 'id', description: 'ID del registro', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  remove(@Param('id') id: string) {
    return this.artisanOriginService.remove(id);
  }
}
