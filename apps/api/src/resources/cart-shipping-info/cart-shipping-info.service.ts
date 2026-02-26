import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCartShippingInfoDto } from './dto/create-cart-shipping-info.dto';
import { UpdateCartShippingInfoDto } from './dto/update-cart-shipping-info.dto';
import { CartShippingInfo } from './entities/cart-shipping-info.entity';

@Injectable()
export class CartShippingInfoService {
  constructor(
    @Inject('CART_SHIPPING_INFO_REPOSITORY')
    private readonly cartShippingInfoRepository: Repository<CartShippingInfo>,
  ) {}

  async create(
    createCartShippingInfoDto: CreateCartShippingInfoDto,
  ): Promise<CartShippingInfo> {
    const shippingInfo = this.cartShippingInfoRepository.create({
      cartId: createCartShippingInfoDto.cartId,
      fullName: createCartShippingInfoDto.fullName,
      email: createCartShippingInfoDto.email,
      phone: createCartShippingInfoDto.phone,
      address: createCartShippingInfoDto.address,
      daneCiudad: createCartShippingInfoDto.daneCiudad,
      descCiudad: createCartShippingInfoDto.descCiudad,
      descDepart: createCartShippingInfoDto.descDepart,
      postalCode: createCartShippingInfoDto.postalCode,
      descEnvio: createCartShippingInfoDto.descEnvio,
      numGuia: createCartShippingInfoDto.numGuia,
      valorFleteMinor: createCartShippingInfoDto.valorFleteMinor?.toString() || '0',
      valorSobreFleteMinor:
        createCartShippingInfoDto.valorSobreFleteMinor?.toString() || '0',
      valorTotalFleteMinor:
        createCartShippingInfoDto.valorTotalFleteMinor?.toString() || '0',
    });

    return await this.cartShippingInfoRepository.save(shippingInfo);
  }

  async findAll(): Promise<CartShippingInfo[]> {
    return await this.cartShippingInfoRepository.find({
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CartShippingInfo> {
    const shippingInfo = await this.cartShippingInfoRepository.findOne({
      where: { id },
      relations: ['cart'],
    });

    if (!shippingInfo) {
      throw new NotFoundException(
        `Información de envío con ID ${id} no encontrada`,
      );
    }

    return shippingInfo;
  }

  async findByCartId(cartId: string): Promise<CartShippingInfo | null> {
    return await this.cartShippingInfoRepository.findOne({
      where: { cartId },
      relations: ['cart'],
    });
  }

  async update(
    id: string,
    updateCartShippingInfoDto: UpdateCartShippingInfoDto,
  ): Promise<CartShippingInfo> {
    const shippingInfo = await this.findOne(id);

    // Actualizar campos si están presentes
    if (updateCartShippingInfoDto.fullName !== undefined) {
      shippingInfo.fullName = updateCartShippingInfoDto.fullName;
    }
    if (updateCartShippingInfoDto.email !== undefined) {
      shippingInfo.email = updateCartShippingInfoDto.email;
    }
    if (updateCartShippingInfoDto.phone !== undefined) {
      shippingInfo.phone = updateCartShippingInfoDto.phone;
    }
    if (updateCartShippingInfoDto.address !== undefined) {
      shippingInfo.address = updateCartShippingInfoDto.address;
    }
    if (updateCartShippingInfoDto.daneCiudad !== undefined) {
      shippingInfo.daneCiudad = updateCartShippingInfoDto.daneCiudad;
    }
    if (updateCartShippingInfoDto.descCiudad !== undefined) {
      shippingInfo.descCiudad = updateCartShippingInfoDto.descCiudad;
    }
    if (updateCartShippingInfoDto.descDepart !== undefined) {
      shippingInfo.descDepart = updateCartShippingInfoDto.descDepart;
    }
    if (updateCartShippingInfoDto.postalCode !== undefined) {
      shippingInfo.postalCode = updateCartShippingInfoDto.postalCode;
    }
    if (updateCartShippingInfoDto.descEnvio !== undefined) {
      shippingInfo.descEnvio = updateCartShippingInfoDto.descEnvio;
    }
    if (updateCartShippingInfoDto.numGuia !== undefined) {
      shippingInfo.numGuia = updateCartShippingInfoDto.numGuia;
    }
    if (updateCartShippingInfoDto.valorFleteMinor !== undefined) {
      shippingInfo.valorFleteMinor =
        updateCartShippingInfoDto.valorFleteMinor.toString();
    }
    if (updateCartShippingInfoDto.valorSobreFleteMinor !== undefined) {
      shippingInfo.valorSobreFleteMinor =
        updateCartShippingInfoDto.valorSobreFleteMinor.toString();
    }
    if (updateCartShippingInfoDto.valorTotalFleteMinor !== undefined) {
      shippingInfo.valorTotalFleteMinor =
        updateCartShippingInfoDto.valorTotalFleteMinor.toString();
    }

    return await this.cartShippingInfoRepository.save(shippingInfo);
  }

  async remove(id: string): Promise<void> {
    const shippingInfo = await this.findOne(id);
    await this.cartShippingInfoRepository.remove(shippingInfo);
  }
}
