import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StorePoliciesConfigService } from './store-policies-config.service';
import { CreateStorePoliciesConfigDto } from './dto/create-store-policies-config.dto';
import { UpdateStorePoliciesConfigDto } from './dto/update-store-policies-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('store-policies-config')
@Controller('store-policies-config')
export class StorePoliciesConfigController {
  constructor(
    private readonly storePoliciesConfigService: StorePoliciesConfigService,
  ) {}

  /**
   * POST /store-policies-config
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una configuración de políticas' })
  @ApiResponse({ status: 201, description: 'Configuración creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateStorePoliciesConfigDto) {
    return await this.storePoliciesConfigService.create(createDto);
  }

  /**
   * GET /store-policies-config/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una configuración de políticas por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Configuración encontrada' })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async getById(@Param('id') id: string) {
    return await this.storePoliciesConfigService.getById(id);
  }

  /**
   * PATCH /store-policies-config/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una configuración de políticas' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Configuración actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStorePoliciesConfigDto,
  ) {
    return await this.storePoliciesConfigService.update(id, updateDto);
  }

  /**
   * DELETE /store-policies-config/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una configuración de políticas' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Configuración eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async delete(@Param('id') id: string) {
    return await this.storePoliciesConfigService.delete(id);
  }
}
