import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ArtisanMediaWorkingService } from './artisan-media-working.service';
import { CreateArtisanMediaWorkingDto } from './dto/create-artisan-media-working.dto';
import { UpdateArtisanMediaWorkingDto } from './dto/update-artisan-media-working.dto';

@ApiTags('Artisan Media Working')
@Controller('artisan-media-working')
export class ArtisanMediaWorkingController {
  constructor(private readonly artisanMediaWorkingService: ArtisanMediaWorkingService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo medio de trabajo' })
  create(@Body() createArtisanMediaWorkingDto: CreateArtisanMediaWorkingDto) {
    return this.artisanMediaWorkingService.create(createArtisanMediaWorkingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los medios de trabajo' })
  findAll() {
    return this.artisanMediaWorkingService.findAll();
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener todos los medios de trabajo de un artesano' })
  @ApiParam({ name: 'artisanId', description: 'ID del artesano' })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.artisanMediaWorkingService.findByArtisan(artisanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medio de trabajo por ID' })
  @ApiParam({ name: 'id', description: 'ID del medio de trabajo' })
  findOne(@Param('id') id: string) {
    return this.artisanMediaWorkingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medio de trabajo' })
  @ApiParam({ name: 'id', description: 'ID del medio de trabajo' })
  update(@Param('id') id: string, @Body() updateArtisanMediaWorkingDto: UpdateArtisanMediaWorkingDto) {
    return this.artisanMediaWorkingService.update(id, updateArtisanMediaWorkingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un medio de trabajo' })
  @ApiParam({ name: 'id', description: 'ID del medio de trabajo' })
  remove(@Param('id') id: string) {
    return this.artisanMediaWorkingService.remove(id);
  }
}
