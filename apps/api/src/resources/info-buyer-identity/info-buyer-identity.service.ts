import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InfoBuyerIdentity } from './entities/info-buyer-identity.entity';

@Injectable()
export class InfoBuyerIdentityService {
  constructor(
    @Inject('INFO_BUYER_IDENTITY_REPOSITORY')
    private readonly infoBuyerIdentityRepository: Repository<InfoBuyerIdentity>,
  ) {}

  /**
   * Obtener todos los registros de info-buyer-identity
   */
  async findAll(): Promise<InfoBuyerIdentity[]> {
    return await this.infoBuyerIdentityRepository.find({
      order: { id: 'ASC' },
    });
  }

  /**
   * Obtener un registro por ID
   */
  async findOne(id: number): Promise<InfoBuyerIdentity> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const record = await this.infoBuyerIdentityRepository.findOne({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Registro con ID ${id} no encontrado en info-buyer-identity`,
      );
    }

    return record;
  }

  /**
   * Obtener registros por product_id
   */
  async findByProductId(productId: string): Promise<InfoBuyerIdentity[]> {
    if (!productId) {
      throw new BadRequestException('El product_id es requerido');
    }

    return await this.infoBuyerIdentityRepository.find({
      where: { productId },
      order: { id: 'ASC' },
    });
  }

  /**
   * Obtener registros por sku_product
   */
  async findBySkuProduct(skuProduct: string): Promise<InfoBuyerIdentity[]> {
    if (!skuProduct) {
      throw new BadRequestException('El sku_product es requerido');
    }

    return await this.infoBuyerIdentityRepository.find({
      where: { skuProduct },
      order: { id: 'ASC' },
    });
  }
}
