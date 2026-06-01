import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { StoryLibrary } from './entities/story-library.entity';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoryLibraryService {
  constructor(
    @Inject('STORY_LIBRARY_REPOSITORY')
    private readonly storyRepo: Repository<StoryLibrary>,
  ) {}

  async create(dto: CreateStoryDto): Promise<StoryLibrary> {
    const story = this.storyRepo.create({
      artisanId: dto.artisanId,
      title: dto.title,
      type: dto.type ?? 'process',
      content: dto.content,
      isPublic: dto.isPublic ?? false,
    });
    return this.storyRepo.save(story);
  }

  async clone(id: string, artisanId: string): Promise<StoryLibrary> {
    const original = await this.findOne(id);
    const copy = this.storyRepo.create({
      artisanId,
      title: `[Copia] ${original.title}`,
      type: original.type,
      content: original.content,
      isPublic: false,
    });
    return this.storyRepo.save(copy);
  }

  async findByArtisan(artisanId: string): Promise<StoryLibrary[]> {
    if (!artisanId) throw new BadRequestException('artisan_id es requerido');
    return this.storyRepo.find({
      where: { artisanId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<StoryLibrary> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException(`Historia con ID ${id} no encontrada`);
    return story;
  }

  async update(id: string, dto: UpdateStoryDto, requestingArtisanId: string): Promise<StoryLibrary> {
    const story = await this.findOne(id);
    if (story.artisanId !== requestingArtisanId) {
      throw new ForbiddenException('No tienes permiso para editar esta historia');
    }
    await this.storyRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string, requestingArtisanId: string): Promise<{ message: string }> {
    const story = await this.findOne(id);
    if (story.artisanId !== requestingArtisanId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta historia');
    }
    await this.storyRepo.delete(id);
    return { message: `Historia con ID ${id} eliminada` };
  }

  async attachToProduct(storyId: string, productId: string): Promise<{ message: string }> {
    await this.findOne(storyId);
    await this.storyRepo.query(
      `INSERT INTO artesanos.product_stories (product_id, story_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [productId, storyId],
    );
    return { message: 'Historia vinculada al producto' };
  }

  async detachFromProduct(storyId: string, productId: string): Promise<{ message: string }> {
    await this.storyRepo.query(
      `DELETE FROM artesanos.product_stories WHERE product_id = $1 AND story_id = $2`,
      [productId, storyId],
    );
    return { message: 'Historia desvinculada del producto' };
  }

  async findByProduct(productId: string): Promise<StoryLibrary[]> {
    return this.storyRepo.query(
      `SELECT sl.* FROM artesanos.story_library sl
       JOIN artesanos.product_stories ps ON ps.story_id = sl.id
       WHERE ps.product_id = $1
       ORDER BY sl.created_at DESC`,
      [productId],
    );
  }
}
