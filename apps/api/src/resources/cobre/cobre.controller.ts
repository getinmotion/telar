import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CobreService } from './cobre.service';
import { GetCounterpartyDto } from './dto/get-counterparty.dto';
import { CobreCounterpartyResponse } from './dto/cobre-auth-response.dto';
import { CreateCounterpartyAdminDto } from './dto/create-counterparty-admin.dto';
import { CreateCounterpartySelfDto } from './dto/create-counterparty-self.dto';

@ApiTags('cobre')
@Controller('cobre')
export class CobreController {
  constructor(private readonly cobreService: CobreService) {}

  @Post('counterparty')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener datos de una contraparte (counterparty) de Cobre',
    description:
      'Autentica con la API de Cobre y obtiene los datos de una contraparte específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de la contraparte obtenidos exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'ID de contraparte inválido',
  })
  @ApiResponse({
    status: 500,
    description:
      'Error de autenticación con Cobre o error interno del servidor',
  })
  async getCounterparty(
    @Body() getCounterpartyDto: GetCounterpartyDto,
  ): Promise<CobreCounterpartyResponse> {
    return this.cobreService.getCounterparty(
      getCounterpartyDto.counterparty_id,
    );
  }

  @Post('counterparty-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear contraparte para una tienda (admin)',
    description:
      'Crea una contraparte en Cobre y la vincula a la tienda actualizando id_contraparty',
  })
  @ApiResponse({
    status: 201,
    description: 'Contraparte creada y vinculada a la tienda',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno o de Cobre API' })
  async createCounterpartyAdmin(
    @Body() dto: CreateCounterpartyAdminDto,
  ): Promise<{ id_contraparty: string }> {
    return this.cobreService.createCounterpartyAdmin(dto.shopId, dto.bankData);
  }

  @Post('counterparty-self')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear o reemplazar contraparte del artesano autenticado',
    description:
      'Crea una contraparte en Cobre para la tienda del artesano y actualiza id_contraparty',
  })
  @ApiResponse({ status: 201, description: 'Contraparte creada y vinculada' })
  @ApiResponse({
    status: 400,
    description: 'Usuario sin tienda o datos inválidos',
  })
  async createCounterpartySelf(
    @Body() dto: CreateCounterpartySelfDto,
  ): Promise<{ id_contraparty: string }> {
    return this.cobreService.createCounterpartySelf(dto);
  }
}
