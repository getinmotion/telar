import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanProfileHistory } from './entities/artisan-profile-history.entity';
import { ArtisanProfileHistoryTimeline } from './entities/artisan-profile-history-timeline.entity';
import {
  GenerateArtisanProfileHistoryDto,
  ArtisanProfileHistoryResponse,
} from 'src/resources/ai/dto/artisan-profile-history.dto';

@Injectable()
export class ArtisanProfileHistoryDbService {
  constructor(
    @Inject('ARTISAN_PROFILE_HISTORY_REPOSITORY')
    private readonly historyRepo: Repository<ArtisanProfileHistory>,
    @Inject('ARTISAN_PROFILE_HISTORY_TIMELINE_REPOSITORY')
    private readonly timelineRepo: Repository<ArtisanProfileHistoryTimeline>,
  ) {}

  async save(
    artisanId: string,
    dto: GenerateArtisanProfileHistoryDto,
    response: ArtisanProfileHistoryResponse,
  ): Promise<ArtisanProfileHistory> {
    const history = this.historyRepo.create({
      artisanId,
      shopName: dto.shopName,
      craftType: dto.craftType,
      region: dto.region,
      heroTitle: response.heroTitle,
      heroSubtitle: response.heroSubtitle,
      claim: response.claim,
      originStory: response.originStory,
      culturalStory: response.culturalStory,
      craftStory: response.craftStory,
      workshopStory: response.workshopStory,
      artisanQuote: response.artisanQuote,
      closingMessage: response.closingMessage,
    });

    const saved = await this.historyRepo.save(history);

    const timelineEntities = response.timeline.map((event, index) =>
      this.timelineRepo.create({
        historyId: saved.id,
        year: event.year,
        event: event.event,
        sortOrder: index,
      }),
    );

    await this.timelineRepo.save(timelineEntities);

    saved.timeline = timelineEntities;
    return saved;
  }

  async findByArtisan(artisanId: string): Promise<ArtisanProfileHistory[]> {
    return this.historyRepo.find({
      where: { artisanId },
      relations: ['timeline'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ArtisanProfileHistory> {
    const history = await this.historyRepo.findOne({
      where: { id },
      relations: ['timeline'],
    });

    if (!history) {
      throw new NotFoundException(`Historia de perfil ${id} no encontrada`);
    }

    history.timeline?.sort((a, b) => a.sortOrder - b.sortOrder);
    return history;
  }
}
