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
import { ArtisanIdentityService } from './artisan-identity.service';
import { CreateArtisanIdentityDto } from './dto/create-artisan-identity.dto';
import { UpdateArtisanIdentityDto } from './dto/update-artisan-identity.dto';
import { ArtisanIdentity } from './entities/artisan-identity.entity';

@ApiTags('Artisan Identity')
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
  create(@Body() createArtisanIdentityDto: CreateArtisanIdentityDto) {
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
  findAll() {
    return this.artisanIdentityService.findAll();
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
  remove(@Param('id') id: string) {
    return this.artisanIdentityService.remove(id);
  }
}
