import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateAchievementsCatalogDto } from './dto/create-achievements-catalog.dto';
import { UpdateAchievementsCatalogDto } from './dto/update-achievements-catalog.dto';
import { AchievementsCatalog } from './entities/achievements-catalog.entity';

@Injectable()
export class AchievementsCatalogService {
  constructor(
    @Inject('ACHIEVEMENTS_CATALOG_REPOSITORY')
    private readonly achievementsCatalogRepository: Repository<AchievementsCatalog>,
  ) {}

  async create(
    createAchievementsCatalogDto: CreateAchievementsCatalogDto,
  ): Promise<AchievementsCatalog> {
    const existing = await this.achievementsCatalogRepository.findOne({
      where: { id: createAchievementsCatalogDto.id },
    });

    if (existing) {
      throw new ConflictException(
        `Achievement with ID ${createAchievementsCatalogDto.id} already exists`,
      );
    }

    const achievement = this.achievementsCatalogRepository.create(
      createAchievementsCatalogDto,
    );
    return await this.achievementsCatalogRepository.save(achievement);
  }

  async getAll(): Promise<AchievementsCatalog[]> {
    return await this.achievementsCatalogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: string): Promise<AchievementsCatalog> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const achievement = await this.achievementsCatalogRepository.findOne({
      where: { id },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return achievement;
  }

  async getByCategory(category: string): Promise<AchievementsCatalog[]> {
    if (!category) {
      throw new BadRequestException('Category is required');
    }

    return await this.achievementsCatalogRepository.find({
      where: { category },
      order: { tier: 'ASC', createdAt: 'DESC' },
    });
  }

  async getByTier(tier: string): Promise<AchievementsCatalog[]> {
    if (!tier) {
      throw new BadRequestException('Tier is required');
    }

    return await this.achievementsCatalogRepository.find({
      where: { tier },
      order: { category: 'ASC', createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateAchievementsCatalogDto: UpdateAchievementsCatalogDto,
  ): Promise<AchievementsCatalog> {
    await this.getById(id);

    await this.achievementsCatalogRepository.update(
      id,
      updateAchievementsCatalogDto,
    );

    return await this.getById(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);

    await this.achievementsCatalogRepository.delete(id);

    return {
      message: `Achievement with ID ${id} deleted successfully`,
    };
  }
}
