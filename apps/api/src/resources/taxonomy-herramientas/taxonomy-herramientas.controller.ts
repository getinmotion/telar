import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaxonomyHerramientasService } from './taxonomy-herramientas.service';
import { CreateHerramientaDto } from './dto/create-herramienta.dto';
import { UpdateHerramientaDto } from './dto/update-herramienta.dto';
import { HerramientaStatus } from './entities/herramienta.entity';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(HerramientaStatus)
  status: HerramientaStatus;

  @IsOptional()
  @IsUUID()
  mergeIntoId?: string;
}

@Controller('taxonomy/herramientas')
export class TaxonomyHerramientasController {
  constructor(private readonly service: TaxonomyHerramientasService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateHerramientaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateHerramientaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.mergeIntoId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
