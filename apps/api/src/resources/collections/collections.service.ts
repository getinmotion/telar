import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CollectionDocument } from './schemas/collection.schema';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

export interface ListCollectionsOptions {
  status?: 'draft' | 'published';
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class CollectionsService {
  constructor(
    @Inject('COLLECTION_MODEL')
    private readonly model: Model<CollectionDocument>,
  ) {}

  async findAll(options: ListCollectionsOptions = {}) {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const offset = Math.max(0, options.offset ?? 0);

    const filter: any = {};
    if (options.status) filter.status = options.status;
    if (options.search && options.search.trim()) {
      const re = new RegExp(
        options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ title: re }, { excerpt: re }, { slug: re }];
    }

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total, limit, offset };
  }

  async findBySlug(slug: string, options: { allowDraft?: boolean } = {}) {
    const filter: any = { slug };
    if (!options.allowDraft) filter.status = 'published';
    const doc = await this.model.findOne(filter).lean().exec();
    if (!doc) throw new NotFoundException(`Collection '${slug}' not found`);
    return doc;
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Collection ${id} not found`);
    return doc;
  }

  async create(dto: CreateCollectionDto) {
    const exists = await this.model.findOne({ slug: dto.slug }).lean().exec();
    if (exists) {
      throw new BadRequestException(`Slug '${dto.slug}' ya está en uso`);
    }
    const doc = await this.model.create({
      ...dto,
      blocks: dto.blocks ?? [],
      keywords: dto.keywords ?? [],
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });
    return doc.toObject();
  }

  async update(id: string, dto: UpdateCollectionDto) {
    if (dto.slug) {
      const conflict = await this.model
        .findOne({ slug: dto.slug, _id: { $ne: id } })
        .lean()
        .exec();
      if (conflict) {
        throw new BadRequestException(`Slug '${dto.slug}' ya está en uso`);
      }
    }
    const updates: any = { ...dto };
    if (dto.publishedAt !== undefined) {
      updates.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }
    const doc = await this.model
      .findByIdAndUpdate(id, updates, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException(`Collection ${id} not found`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`Collection ${id} not found`);
    return { id };
  }
}
