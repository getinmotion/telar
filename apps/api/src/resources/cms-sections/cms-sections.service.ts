import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CmsSection } from './types/cms-section.types';
import { CreateCmsSectionDto } from './dto/create-cms-section.dto';
import { UpdateCmsSectionDto } from './dto/update-cms-section.dto';
import { CmsPageDocument, CmsPageSection } from './schemas/cms-page.schema';
import { CmsSeedSkipsService } from './cms-seed-skips.service';

/**
 * Cada vista pública del marketplace es UN documento en `cms_pages`. El
 * service expone CRUD a nivel de "sección" para que el front no cambie, pero
 * por debajo todo se guarda como un array dentro del doc de la página.
 */
@Injectable()
export class CmsSectionsService {
  private readonly logger = new Logger(CmsSectionsService.name);

  constructor(
    @Inject('CMS_PAGE_MODEL')
    private readonly pageModel: Model<CmsPageDocument>,
    private readonly seedSkips: CmsSeedSkipsService,
  ) {}

  // ── helpers ───────────────────────────────────────────

  private toSection(input: Omit<CmsSection, 'createdAt' | 'updatedAt'>): CmsPageSection {
    return {
      id: input.id,
      type: input.type,
      position: input.position,
      published: input.published,
      payload: input.payload ?? {},
    };
  }

  private toPublic(
    pageKey: string,
    raw: CmsPageSection,
    page: CmsPageDocument,
  ): CmsSection {
    return {
      id: raw.id,
      pageKey,
      position: raw.position,
      type: raw.type,
      payload: raw.payload ?? {},
      published: !!raw.published,
      createdAt: page.createdAt ?? new Date(),
      updatedAt: page.updatedAt ?? new Date(),
    };
  }

  private async getOrCreatePage(pageKey: string): Promise<CmsPageDocument> {
    const existing = await this.pageModel.findOne({ pageKey }).exec();
    if (existing) return existing;
    return this.pageModel.create({ pageKey, sections: [] });
  }

  // ── public API ────────────────────────────────────────

  async findAllByPage(
    pageKey: string,
    includeUnpublished = false,
  ): Promise<CmsSection[]> {
    const page = await this.pageModel.findOne({ pageKey }).exec();
    if (!page) return [];
    const list = (page.sections ?? [])
      .filter((s) => includeUnpublished || s.published)
      .sort((a, b) => a.position - b.position);
    return list.map((s) => this.toPublic(pageKey, s, page));
  }

  async findOne(id: string): Promise<CmsSection> {
    const page = await this.pageModel
      .findOne({ 'sections.id': id })
      .exec();
    if (!page) throw new NotFoundException(`CmsSection ${id} not found`);
    const raw = (page.sections ?? []).find((s) => s.id === id);
    if (!raw) throw new NotFoundException(`CmsSection ${id} not found`);
    return this.toPublic(page.pageKey, raw, page);
  }

  async create(dto: CreateCmsSectionDto): Promise<CmsSection> {
    if (!dto.pageKey) throw new BadRequestException('pageKey is required');

    const page = await this.getOrCreatePage(dto.pageKey);
    const positions = (page.sections ?? []).map((s) => s.position);
    const position =
      typeof dto.position === 'number'
        ? dto.position
        : positions.length > 0
        ? Math.max(...positions) + 1
        : 0;

    const newSection = this.toSection({
      id: randomUUID(),
      pageKey: dto.pageKey,
      type: dto.type,
      position,
      published: dto.published ?? false,
      payload: dto.payload ?? {},
    } as any);

    page.sections = [...(page.sections ?? []), newSection];
    page.markModified('sections');
    const saved = await page.save();
    return this.toPublic(dto.pageKey, newSection, saved);
  }

  async update(id: string, dto: UpdateCmsSectionDto): Promise<CmsSection> {
    const page = await this.pageModel
      .findOne({ 'sections.id': id })
      .exec();
    if (!page) throw new NotFoundException(`CmsSection ${id} not found`);

    const idx = (page.sections ?? []).findIndex((s) => s.id === id);
    if (idx < 0) throw new NotFoundException(`CmsSection ${id} not found`);

    const current = page.sections[idx];
    const next: CmsPageSection = {
      ...current,
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.payload !== undefined ? { payload: dto.payload } : {}),
      ...(dto.position !== undefined ? { position: dto.position } : {}),
      ...(dto.published !== undefined ? { published: dto.published } : {}),
    };
    page.sections[idx] = next;
    page.markModified('sections');
    const saved = await page.save();
    return this.toPublic(page.pageKey, next, saved);
  }

  async remove(id: string): Promise<{ id: string }> {
    const page = await this.pageModel
      .findOne({ 'sections.id': id })
      .exec();
    if (!page) throw new NotFoundException(`CmsSection ${id} not found`);
    const target = (page.sections ?? []).find((s) => s.id === id);
    page.sections = (page.sections ?? []).filter((s) => s.id !== id);
    page.markModified('sections');
    await page.save();
    if (target) {
      await this.seedSkips.record(
        'cms_page_section',
        `${page.pageKey}:${target.type}:${target.position}`,
      );
    }
    return { id };
  }

  async reorder(
    pageKey: string,
    orderedIds: string[],
  ): Promise<CmsSection[]> {
    const page = await this.getOrCreatePage(pageKey);
    const byId = new Map<string, CmsPageSection>(
      (page.sections ?? []).map((s) => [s.id, s]),
    );
    const next: CmsPageSection[] = [];
    orderedIds.forEach((id, position) => {
      const found = byId.get(id);
      if (!found) return;
      next.push({ ...found, position });
      byId.delete(id);
    });
    let pos = next.length;
    for (const leftover of byId.values()) {
      next.push({ ...leftover, position: pos++ });
    }
    page.sections = next;
    page.markModified('sections');
    const saved = await page.save();
    return next
      .sort((a, b) => a.position - b.position)
      .map((s) => this.toPublic(pageKey, s, saved));
  }
}
