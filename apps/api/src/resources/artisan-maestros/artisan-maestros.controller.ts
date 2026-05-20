import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArtisanMaestrosService } from './artisan-maestros.service';
import { CreateArtisanMaestroDto } from './dto/create-artisan-maestro.dto';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';

@ApiTags('Artisan Maestros')
@Controller('artisan-maestros')
@UseGuards(JwtAuthGuard)
export class ArtisanMaestrosController {
  constructor(private readonly service: ArtisanMaestrosService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar un maestro al perfil artesanal' })
  create(@Body() dto: CreateArtisanMaestroDto) {
    return this.service.create(dto);
  }

  @Get('artisan/:artisanId')
  @ApiOperation({ summary: 'Obtener maestros de un artesano' })
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.service.findByArtisan(artisanId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un maestro del perfil artesanal' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
