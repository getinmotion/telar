import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ArtisanMediaWorkshopService } from './artisan-media-workshop.service';
import { CreateArtisanMediaWorkshopDto } from './dto/create-artisan-media-workshop.dto';
import { UpdateArtisanMediaWorkshopDto } from './dto/update-artisan-media-workshop.dto';

@ApiTags('Artisan Media Workshop')
@Controller('artisan-media-workshop')
export class ArtisanMediaWorkshopController {
  constructor(private readonly artisanMediaWorkshopService: ArtisanMediaWorkshopService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo medio de taller' })
  create(@Body() createArtisanMediaWorkshopDto: CreateArtisanMediaWorkshopDto) {
    return this.artisanMediaWorkshopService.create(createArtisanMediaWorkshopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los medios de taller' })
  findAll() {
    return this.artisanMediaWorkshopService.findAll();
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener todos los medios de taller de un artesano' })
  @ApiParam({ name: 'artisanId', description: 'ID del artesano' })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.artisanMediaWorkshopService.findByArtisan(artisanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medio de taller por ID' })
  @ApiParam({ name: 'id', description: 'ID del medio de taller' })
  findOne(@Param('id') id: string) {
    return this.artisanMediaWorkshopService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medio de taller' })
  @ApiParam({ name: 'id', description: 'ID del medio de taller' })
  update(@Param('id') id: string, @Body() updateArtisanMediaWorkshopDto: UpdateArtisanMediaWorkshopDto) {
    return this.artisanMediaWorkshopService.update(id, updateArtisanMediaWorkshopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un medio de taller' })
  @ApiParam({ name: 'id', description: 'ID del medio de taller' })
  remove(@Param('id') id: string) {
    return this.artisanMediaWorkshopService.remove(id);
  }
}
