import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ArtisanMediaCommunityService } from './artisan-media-community.service';
import { CreateArtisanMediaCommunityDto } from './dto/create-artisan-media-community.dto';
import { UpdateArtisanMediaCommunityDto } from './dto/update-artisan-media-community.dto';

@ApiTags('Artisan Media Community')
@Controller('artisan-media-community')
export class ArtisanMediaCommunityController {
  constructor(private readonly artisanMediaCommunityService: ArtisanMediaCommunityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo medio de comunidad' })
  create(@Body() createArtisanMediaCommunityDto: CreateArtisanMediaCommunityDto) {
    return this.artisanMediaCommunityService.create(createArtisanMediaCommunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los medios de comunidad' })
  findAll() {
    return this.artisanMediaCommunityService.findAll();
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener todos los medios de comunidad de un artesano' })
  @ApiParam({ name: 'artisanId', description: 'ID del artesano' })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.artisanMediaCommunityService.findByArtisan(artisanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medio de comunidad por ID' })
  @ApiParam({ name: 'id', description: 'ID del medio de comunidad' })
  findOne(@Param('id') id: string) {
    return this.artisanMediaCommunityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medio de comunidad' })
  @ApiParam({ name: 'id', description: 'ID del medio de comunidad' })
  update(@Param('id') id: string, @Body() updateArtisanMediaCommunityDto: UpdateArtisanMediaCommunityDto) {
    return this.artisanMediaCommunityService.update(id, updateArtisanMediaCommunityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un medio de comunidad' })
  @ApiParam({ name: 'id', description: 'ID del medio de comunidad' })
  remove(@Param('id') id: string) {
    return this.artisanMediaCommunityService.remove(id);
  }
}
