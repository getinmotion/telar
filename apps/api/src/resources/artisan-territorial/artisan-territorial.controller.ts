import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ArtisanTerritorialService } from './artisan-territorial.service';
import { CreateArtisanTerritorialDto } from './dto/create-artisan-territorial.dto';
import { UpdateArtisanTerritorialDto } from './dto/update-artisan-territorial.dto';

@ApiTags('Artisan Territorial')
@Controller('artisan-territorial')
export class ArtisanTerritorialController {
  constructor(private readonly artisanTerritorialService: ArtisanTerritorialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro territorial' })
  create(@Body() createArtisanTerritorialDto: CreateArtisanTerritorialDto) {
    return this.artisanTerritorialService.create(createArtisanTerritorialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros territoriales' })
  findAll() {
    return this.artisanTerritorialService.findAll();
  }

  @Get('territory/:territorialId')
  @ApiOperation({ summary: 'Obtener todos los registros de un territorio' })
  @ApiParam({ name: 'territorialId', description: 'ID del territorio' })
  findByTerritory(@Param('territorialId') territorialId: string) {
    return this.artisanTerritorialService.findByTerritory(territorialId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro territorial por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro territorial' })
  findOne(@Param('id') id: string) {
    return this.artisanTerritorialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro territorial' })
  @ApiParam({ name: 'id', description: 'ID del registro territorial' })
  update(@Param('id') id: string, @Body() updateArtisanTerritorialDto: UpdateArtisanTerritorialDto) {
    return this.artisanTerritorialService.update(id, updateArtisanTerritorialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro territorial' })
  @ApiParam({ name: 'id', description: 'ID del registro territorial' })
  remove(@Param('id') id: string) {
    return this.artisanTerritorialService.remove(id);
  }
}
