import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServientregaService } from './servientrega.service';
import { QuoteShippingDto } from './dto/quote-shipping.dto';
import { QuoteStandaloneDto } from './dto/quote-standalone.dto';
import {
  QuoteShippingResponse,
  StandaloneQuoteResponse,
  ShopPhysicalSpecsRow,
} from './interfaces/servientrega.interface';

@ApiTags('servientrega')
@Controller('servientrega')
export class ServientregaController {
  constructor(private readonly servientregaService: ServientregaService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Cotizar envío con Servientrega',
    description:
      'Calcula el costo de envío para un carrito específico a una ciudad destino. Agrupa productos por tienda y cotiza cada envío individualmente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cotización exitosa',
    schema: {
      example: {
        success: true,
        cart_id: '123e4567-e89b-12d3-a456-426614174000',
        destination_city: '11001',
        quotes: [
          {
            shopId: 'shop-uuid',
            shopName: 'Artesanías Colombia',
            originCity: '11001',
            destinationCity: '11001',
            shippingCost: 15000,
            estimatedDays: 5,
          },
        ],
        totalShipping: 15000,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async quoteShipping(
    @Body() dto: QuoteShippingDto,
  ): Promise<QuoteShippingResponse> {
    return this.servientregaService.quoteShipping(dto);
  }

  @Post('quote-standalone')
  @ApiOperation({
    summary: 'Cotizar envío standalone (sin carrito)',
    description:
      'Calcula el costo de envío usando dimensiones y peso directamente, sin necesidad de un carrito existente.',
  })
  @ApiResponse({ status: 200, description: 'Cotización exitosa' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async quoteStandalone(
    @Body() dto: QuoteStandaloneDto,
  ): Promise<StandaloneQuoteResponse> {
    return this.servientregaService.quoteStandalone(dto);
  }

  @Get('shops-physical-specs')
  @ApiOperation({
    summary: 'Obtener tiendas con specs físicas de productos',
    description:
      'Retorna todas las tiendas activas con las dimensiones y pesos de sus productos para análisis de envíos.',
  })
  @ApiResponse({ status: 200, description: 'Datos obtenidos exitosamente' })
  async getShopsWithPhysicalSpecs(): Promise<ShopPhysicalSpecsRow[]> {
    return this.servientregaService.getShopsWithPhysicalSpecs();
  }
}
