import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SuggestProductsDraftService } from './suggest-products-draft.service';
import { CreateSuggestProductsDraftDto } from './dto/create-suggest-products-draft.dto';
import { UpdateSuggestProductsDraftDto } from './dto/update-suggest-products-draft.dto';
import { SuggestProductsDraftResponseDto } from './dto/suggest-products-draft-response.dto';

@ApiTags('Suggest Products Draft')
@Controller('suggest-products-draft')
export class SuggestProductsDraftController {
  constructor(
    private readonly suggestProductsDraftService: SuggestProductsDraftService,
  ) {}

  /**
   * Crear un nuevo registro de sugerencias
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear registro de sugerencias',
    description: 'Crea un nuevo registro para almacenar las sugerencias de los agentes para un producto',
  })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: SuggestProductsDraftResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async create(
    @Body() createDto: CreateSuggestProductsDraftDto,
  ): Promise<SuggestProductsDraftResponseDto> {
    return await this.suggestProductsDraftService.create(createDto);
  }

  /**
   * Obtener todos los registros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos los registros de sugerencias',
    description: 'Obtiene todos los registros de sugerencias ordenados por fecha de creación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros obtenida exitosamente',
    type: [SuggestProductsDraftResponseDto],
  })
  async findAll(): Promise<SuggestProductsDraftResponseDto[]> {
    return await this.suggestProductsDraftService.findAll();
  }

  /**
   * Obtener un registro por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener registro por ID',
    description: 'Obtiene un registro específico de sugerencias por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: SuggestProductsDraftResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<SuggestProductsDraftResponseDto> {
    return await this.suggestProductsDraftService.findOne(id);
  }

  /**
   * Obtener un registro por product_id
   */
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Obtener registro por product_id',
    description: 'Obtiene el registro de sugerencias asociado a un producto específico',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    example: '01cad568-37b2-490f-87e4-90ebbf996323',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: SuggestProductsDraftResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<SuggestProductsDraftResponseDto | null> {
    return await this.suggestProductsDraftService.findByProductId(productId);
  }

  /**
   * Actualizar un registro
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar registro',
    description: 'Actualiza un registro existente de sugerencias',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    type: SuggestProductsDraftResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSuggestProductsDraftDto,
  ): Promise<SuggestProductsDraftResponseDto> {
    return await this.suggestProductsDraftService.update(id, updateDto);
  }

  /**
   * Actualizar o crear por product_id (upsert)
   */
  @Put('product/:productId')
  @ApiOperation({
    summary: 'Actualizar o crear registro por product_id',
    description: 'Actualiza un registro existente o crea uno nuevo si no existe para el producto especificado',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    example: '01cad568-37b2-490f-87e4-90ebbf996323',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado o creado exitosamente',
    type: SuggestProductsDraftResponseDto,
  })
  async upsertByProductId(
    @Param('productId') productId: string,
    @Body() data: Partial<CreateSuggestProductsDraftDto>,
  ): Promise<SuggestProductsDraftResponseDto> {
    return await this.suggestProductsDraftService.upsertByProductId(
      productId,
      data,
    );
  }

  /**
   * Eliminar un registro
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar registro',
    description: 'Elimina un registro de sugerencias',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.suggestProductsDraftService.remove(id);
  }
}
