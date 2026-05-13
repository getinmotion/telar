import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Patch,
  Body,
} from '@nestjs/common';
import { InfoBuyerIdentityService } from './info-buyer-identity.service';
import { InfoBuyerIdentity } from './entities/info-buyer-identity.entity';
import { UpdateInfoBuyerIdentityDto } from './dto/update-info-buyer-identity.dto';

@Controller('info-buyer-identity')
export class InfoBuyerIdentityController {
  constructor(
    private readonly infoBuyerIdentityService: InfoBuyerIdentityService,
  ) {}

  /**
   * GET /info-buyer-identity
   * Obtener todos los registros
   */
  @Get()
  findAll(): Promise<InfoBuyerIdentity[]> {
    return this.infoBuyerIdentityService.findAll();
  }

  /**
   * GET /info-buyer-identity/:id
   * Obtener un registro por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<InfoBuyerIdentity> {
    return this.infoBuyerIdentityService.findOne(id);
  }

  /**
   * GET /info-buyer-identity/product/:productId
   * Obtener registros por product_id
   */
  @Get('product/:productId')
  findByProductId(
    @Param('productId') productId: string,
  ): Promise<InfoBuyerIdentity[]> {
    return this.infoBuyerIdentityService.findByProductId(productId);
  }

  /**
   * GET /info-buyer-identity/sku/:skuProduct
   * Obtener registros por sku_product
   */
  @Get('sku/:skuProduct')
  findBySkuProduct(
    @Param('skuProduct') skuProduct: string,
  ): Promise<InfoBuyerIdentity[]> {
    return this.infoBuyerIdentityService.findBySkuProduct(skuProduct);
  }

  /**
   * PATCH /info-buyer-identity/:id
   * Actualizar información de contacto de un registro
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInfoBuyerIdentityDto,
  ): Promise<InfoBuyerIdentity> {
    return this.infoBuyerIdentityService.update(id, updateDto);
  }
}
