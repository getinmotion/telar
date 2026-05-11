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

  /**
   * Actualizar un registro de info-buyer-identity
   */
  async update(
    id: number,
    updateData: Partial<
      Pick<InfoBuyerIdentity, 'nombreCompleto' | 'email' | 'celular'>
    >,
  ): Promise<InfoBuyerIdentity> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    // Verificar que el registro existe
    const record = await this.findOne(id);

    // Actualizar los campos permitidos
    if (updateData.nombreCompleto !== undefined) {
      record.nombreCompleto = updateData.nombreCompleto;
    }
    if (updateData.email !== undefined) {
      record.email = updateData.email;
    }
    if (updateData.celular !== undefined) {
      record.celular = updateData.celular;
    }

    return await this.infoBuyerIdentityRepository.save(record);
  }
}
