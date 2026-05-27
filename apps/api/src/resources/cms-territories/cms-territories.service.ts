import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { TerritoryDocument } from './schemas/cms-territory.schema';
import { CreateCmsTerritoryDto } from './dto/create-cms-territory.dto';
import { UpdateCmsTerritoryDto } from './dto/update-cms-territory.dto';
import { CmsSeedSkipsService } from '../cms-sections/cms-seed-skips.service';

export interface ListCmsTerritoriesOptions {
  status?: 'draft' | 'published';
  search?: string;
}

@Injectable()
export class CmsTerritoriesService {
  constructor(
    @Inject('CMS_TERRITORY_MODEL')
    private readonly model: Model<TerritoryDocument>,
    private readonly seedSkips: CmsSeedSkipsService,
  ) {}

  async findAll(options: ListCmsTerritoriesOptions = {}) {
    const filter: any = {};
    if (options.status) filter.status = options.status;
    if (options.search && options.search.trim()) {
      const re = new RegExp(
        options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ name: re }, { slug: re }, { region: re }];
    }
    const data = await this.model
      .find(filter)
      .sort({ position: 1, name: 1 })
      .lean()
      .exec();
    return { data, total: data.length };
  }

  async findBySlug(slug: string, options: { allowDraft?: boolean } = {}) {
    const filter: any = { slug };
    if (!options.allowDraft) filter.status = 'published';
    const doc = await this.model.findOne(filter).lean().exec();
    if (!doc) throw new NotFoundException(`Territory '${slug}' not found`);
    return doc;
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Territory ${id} not found`);
    return doc;
  }

  async create(dto: CreateCmsTerritoryDto) {
    const exists = await this.model.findOne({ slug: dto.slug }).lean().exec();
    if (exists) {
      throw new BadRequestException(`Slug '${dto.slug}' ya está en uso`);
    }
    const doc = await this.model.create({
      ...dto,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });
    return doc.toObject();
  }

  async update(id: string, dto: UpdateCmsTerritoryDto) {
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
    if (!doc) throw new NotFoundException(`Territory ${id} not found`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`Territory ${id} not found`);
    if (doc.slug) {
      await this.seedSkips.record('cms_territory', doc.slug);
    }
    return { id };
  }
}
