import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ShopModerationHistory } from './entities/shop-moderation-history.entity';
import { CreateShopModerationHistoryDto } from './dto/create-shop-moderation-history.dto';

@Injectable()
export class ShopModerationHistoryService {
  constructor(
    @Inject('SHOP_MODERATION_HISTORY_REPOSITORY')
    private readonly shopModerationHistoryRepository: Repository<ShopModerationHistory>,
  ) {}

  async create(
    createDto: CreateShopModerationHistoryDto,
  ): Promise<ShopModerationHistory> {
    const newHistory = this.shopModerationHistoryRepository.create(createDto);
    return await this.shopModerationHistoryRepository.save(newHistory);
  }

  async findAll(): Promise<ShopModerationHistory[]> {
    return await this.shopModerationHistoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ShopModerationHistory> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const history = await this.shopModerationHistoryRepository.findOne({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`Historial de tienda con ID ${id} no encontrado`);
    }
    return history;
  }

  async findByShopId(shopId: string): Promise<ShopModerationHistory[]> {
    if (!shopId) throw new BadRequestException('El shopId es requerido');
    return await this.shopModerationHistoryRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByModeratorId(moderatorId: string): Promise<ShopModerationHistory[]> {
    if (!moderatorId) throw new BadRequestException('El moderatorId es requerido');
    return await this.shopModerationHistoryRepository.find({
      where: { moderatorId },
      order: { createdAt: 'DESC' },
    });
  }
}
