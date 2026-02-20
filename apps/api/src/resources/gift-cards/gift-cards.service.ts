import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { UpdateGiftCardDto } from './dto/update-gift-card.dto';

@Injectable()
export class GiftCardsService {
  constructor(
    @Inject('GIFT_CARDS_REPOSITORY')
    private readonly giftCardsRepository: Repository<GiftCard>,
  ) {}

  /**
   * Crear una nueva gift card
   */
  async create(createDto: CreateGiftCardDto): Promise<GiftCard> {
    // Validar que el código sea único
    const existingCard = await this.giftCardsRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingCard) {
      throw new BadRequestException(
        `Ya existe una gift card con el código ${createDto.code}`,
      );
    }

    // Validar que initialAmount sea mayor a 0
    const initialAmount = parseFloat(createDto.initialAmount);
    if (initialAmount <= 0) {
      throw new BadRequestException(
        'El monto inicial debe ser mayor a 0',
      );
    }

    // Validar que remainingAmount sea mayor o igual a 0
    const remainingAmount = parseFloat(createDto.remainingAmount);
    if (remainingAmount < 0) {
      throw new BadRequestException(
        'El monto restante debe ser mayor o igual a 0',
      );
    }

    // Validar que remainingAmount no sea mayor a initialAmount
    if (remainingAmount > initialAmount) {
      throw new BadRequestException(
        'El monto restante no puede ser mayor al monto inicial',
      );
    }

    const newGiftCard = this.giftCardsRepository.create(createDto);
    return await this.giftCardsRepository.save(newGiftCard);
  }

  /**
   * Obtener todas las gift cards
   */
  async findAll(): Promise<GiftCard[]> {
    return await this.giftCardsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una gift card por ID
   */
  async findOne(id: string): Promise<GiftCard> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const giftCard = await this.giftCardsRepository.findOne({
      where: { id },
    });

    if (!giftCard) {
      throw new NotFoundException(`Gift card con ID ${id} no encontrada`);
    }

    return giftCard;
  }

  /**
   * Obtener una gift card por código
   */
  async findByCode(code: string): Promise<GiftCard> {
    if (!code) {
      throw new BadRequestException('El código es requerido');
    }

    const giftCard = await this.giftCardsRepository.findOne({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException(`Gift card con código ${code} no encontrada`);
    }

    return giftCard;
  }

  /**
   * Obtener gift cards por email de usuario (comprador o destinatario)
   * Busca en purchaser_email OR recipient_email
   */
  async findByUserEmail(email: string): Promise<GiftCard[]> {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    return await this.giftCardsRepository
      .createQueryBuilder('gift_card')
      .where('gift_card.purchaser_email = :email', { email })
      .orWhere('gift_card.recipient_email = :email', { email })
      .orderBy('gift_card.created_at', 'DESC')
      .getMany();
  }

  /**
   * Obtener gift cards por purchaser email
   */
  async findByPurchaserEmail(email: string): Promise<GiftCard[]> {
    if (!email) {
      throw new BadRequestException('El email del comprador es requerido');
    }

    return await this.giftCardsRepository.find({
      where: { purchaserEmail: email },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener gift cards por recipient email
   */
  async findByRecipientEmail(email: string): Promise<GiftCard[]> {
    if (!email) {
      throw new BadRequestException('El email del destinatario es requerido');
    }

    return await this.giftCardsRepository.find({
      where: { recipientEmail: email },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una gift card
   */
  async update(id: string, updateDto: UpdateGiftCardDto): Promise<GiftCard> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el código, verificar que sea único
    if (updateDto.code) {
      const existingCard = await this.giftCardsRepository.findOne({
        where: { code: updateDto.code },
      });

      if (existingCard && existingCard.id !== id) {
        throw new BadRequestException(
          `Ya existe una gift card con el código ${updateDto.code}`,
        );
      }
    }

    // Validar montos si se actualizan
    if (updateDto.initialAmount) {
      const initialAmount = parseFloat(updateDto.initialAmount);
      if (initialAmount <= 0) {
        throw new BadRequestException(
          'El monto inicial debe ser mayor a 0',
        );
      }
    }

    if (updateDto.remainingAmount !== undefined) {
      const remainingAmount = parseFloat(updateDto.remainingAmount);
      if (remainingAmount < 0) {
        throw new BadRequestException(
          'El monto restante debe ser mayor o igual a 0',
        );
      }
    }

    // Actualizar
    await this.giftCardsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una gift card
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.giftCardsRepository.delete(id);

    return {
      message: `Gift card con ID ${id} eliminada exitosamente`,
    };
  }
}
