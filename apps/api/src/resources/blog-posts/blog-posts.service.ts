import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { BlogPostDocument } from './schemas/blog-post.schema';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CmsSeedSkipsService } from '../cms-sections/cms-seed-skips.service';

export interface ListBlogPostsOptions {
  status?: 'draft' | 'published';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class BlogPostsService {
  constructor(
    @Inject('BLOG_POST_MODEL')
    private readonly model: Model<BlogPostDocument>,
    private readonly seedSkips: CmsSeedSkipsService,
  ) {}

  async findAll(options: ListBlogPostsOptions = {}) {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const offset = Math.max(0, options.offset ?? 0);

    const filter: any = {};
    if (options.status) filter.status = options.status;
    if (options.category) filter.category = options.category;
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
    if (!doc) throw new NotFoundException(`Blog post '${slug}' not found`);
    return doc;
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Blog post ${id} not found`);
    return doc;
  }

  async create(dto: CreateBlogPostDto) {
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

  async update(id: string, dto: UpdateBlogPostDto) {
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
    if (!doc) throw new NotFoundException(`Blog post ${id} not found`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`Blog post ${id} not found`);
    if (doc.slug) {
      await this.seedSkips.record('blog_post', doc.slug);
    }
    return { id };
  }
}
