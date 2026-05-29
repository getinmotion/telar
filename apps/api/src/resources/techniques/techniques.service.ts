import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository, In } from 'typeorm';
import { Technique, ApprovalStatus } from './entities/technique.entity';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { ProductArtisanalIdentity } from '../products-new/entities/product-artisanal-identity.entity';

type TechniqueWithMeta = Technique & { craftIds: string[] };

@Injectable()
export class TechniquesService {
  constructor(
    @Inject('TECHNIQUES_REPOSITORY')
    private readonly repo: Repository<Technique>,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async loadCraftIds(techniqueIds: string[]): Promise<Map<string, string[]>> {
    if (!techniqueIds.length) return new Map();
    const rows = await this.repo.query<{ technique_id: string; craft_id: string }[]>(
      `SELECT technique_id, craft_id
       FROM taxonomy.technique_craft_links
       WHERE technique_id = ANY($1)`,
      [techniqueIds],
    );
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const arr = map.get(row.technique_id) ?? [];
      arr.push(row.craft_id);
      map.set(row.technique_id, arr);
    }
    return map;
  }

  private async replaceCraftLinks(techniqueId: string, craftIds: string[]): Promise<void> {
    await this.repo.query(
      `DELETE FROM taxonomy.technique_craft_links WHERE technique_id = $1`,
      [techniqueId],
    );
    if (!craftIds.length) return;
    const values = craftIds.map((cid, i) => `($1, $${i + 2})`).join(', ');
    await this.repo.query(
      `INSERT INTO taxonomy.technique_craft_links (technique_id, craft_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [techniqueId, ...craftIds],
    );
  }

  private attach(items: Technique[], map: Map<string, string[]>): TechniqueWithMeta[] {
    return items.map((item) => ({ ...item, craftIds: map.get(item.id) ?? [] }));
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async create(dto: CreateTechniqueDto): Promise<TechniqueWithMeta> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Ya existe una técnica con ese nombre');
    }

    const { craftIds, craftId, ...rest } = dto;
    const technique = this.repo.create({ ...rest, craftId: craftId ?? null });
    const saved = await this.repo.save(technique);

    const allCraftIds = Array.from(new Set([...(craftIds ?? []), ...(craftId ? [craftId] : [])]));
    if (allCraftIds.length) await this.replaceCraftLinks(saved.id, allCraftIds);

    return { ...saved, craftIds: allCraftIds };
  }

  async findAll(search?: string, status?: string, suggestedBy?: string): Promise<TechniqueWithMeta[]> {
    const where: any = {};
    if (status) where.status = status;
    if (suggestedBy) where.suggestedBy = suggestedBy;
    if (search) where.name = ILike(`%${search}%`);

    const items = await this.repo.find({ where, order: { name: 'ASC' } });
    const map = await this.loadCraftIds(items.map((i) => i.id));
    return this.attach(items, map);
  }

  async findAllWithProductCount(
    craftId?: string,
    search?: string,
    status?: string,
  ): Promise<Array<TechniqueWithMeta & { productCount: number }>> {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = ILike(`%${search}%`);

    let items: Technique[];

    if (craftId) {
      // Filtrar via join table (técnicas asociadas al oficio)
      const linked = await this.repo.query<{ technique_id: string }[]>(
        `SELECT technique_id FROM taxonomy.technique_craft_links WHERE craft_id = $1`,
        [craftId],
      );
      const ids = linked.map((r) => r.technique_id);
      if (!ids.length) return [];
      items = await this.repo.find({ where: { ...where, id: In(ids) }, order: { name: 'ASC' } });
    } else {
      items = await this.repo.find({ where, order: { name: 'ASC' } });
    }

    if (!items.length) return [];

    const itemIds = items.map((i) => i.id);

    const [countRows, craftMap] = await Promise.all([
      this.repo
        .createQueryBuilder('t')
        .leftJoin(
          ProductArtisanalIdentity,
          'pai',
          '(pai.primary_technique_id = t.id OR pai.secondary_technique_id = t.id) AND pai.deleted_at IS NULL',
        )
        .select('t.id', 'id')
        .addSelect('COUNT(DISTINCT pai.product_id)::int', 'productCount')
        .where('t.id IN (:...ids)', { ids: itemIds })
        .groupBy('t.id')
        .getRawMany<{ id: string; productCount: number }>(),
      this.loadCraftIds(itemIds),
    ]);

    const countMap = new Map(countRows.map((r) => [r.id, Number(r.productCount) || 0]));
    return items.map((item) => ({
      ...item,
      productCount: countMap.get(item.id) ?? 0,
      craftIds: craftMap.get(item.id) ?? [],
    }));
  }

  async findOne(id: string): Promise<TechniqueWithMeta> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const technique = await this.repo.findOne({ where: { id } });
    if (!technique) throw new NotFoundException(`Técnica con ID ${id} no encontrada`);
    const map = await this.loadCraftIds([id]);
    return { ...technique, craftIds: map.get(id) ?? [] };
  }

  async findByCraftId(craftId: string, status?: string): Promise<TechniqueWithMeta[]> {
    const linked = await this.repo.query<{ technique_id: string }[]>(
      `SELECT technique_id FROM taxonomy.technique_craft_links WHERE craft_id = $1`,
      [craftId],
    );
    const ids = linked.map((r) => r.technique_id);
    if (!ids.length) return [];
    const where: any = { id: In(ids) };
    if (status) where.status = status;
    const items = await this.repo.find({ where, order: { name: 'ASC' } });
    const map = await this.loadCraftIds(ids);
    return this.attach(items, map);
  }

  async findByStatus(status: string): Promise<TechniqueWithMeta[]> {
    const items = await this.repo.find({
      where: { status: status as ApprovalStatus },
      order: { name: 'ASC' },
    });
    const map = await this.loadCraftIds(items.map((i) => i.id));
    return this.attach(items, map);
  }

  async update(id: string, updateDto: UpdateTechniqueDto): Promise<TechniqueWithMeta> {
    await this.findOne(id);

    if (updateDto.name) {
      const existing = await this.repo.findOne({ where: { name: updateDto.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe una técnica con ese nombre');
      }
    }

    const { craftIds, craftId, ...rest } = updateDto as any;

    // Actualizar columna legacy si se pasa craftId explícito
    const colUpdate: any = { ...rest };
    if (craftId !== undefined) colUpdate.craftId = craftId ?? null;

    if (Object.keys(colUpdate).length) {
      await this.repo.update(id, colUpdate);
    }

    // Actualizar craft links si se pasa craftIds (o craftId como single)
    if (craftIds !== undefined || craftId !== undefined) {
      const allCraftIds = Array.from(new Set([
        ...(craftIds ?? []),
        ...(craftId ? [craftId] : []),
      ]));
      await this.replaceCraftLinks(id, allCraftIds);
    }

    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    mergeIntoId?: string,
  ): Promise<TechniqueWithMeta | { message: string }> {
    await this.findOne(id);

    if (mergeIntoId && status === ApprovalStatus.REJECTED) {
      await this.findOne(mergeIntoId);

      // Migrar craft_links al destino
      await this.repo.query(
        `INSERT INTO taxonomy.technique_craft_links (technique_id, craft_id)
         SELECT $1, craft_id FROM taxonomy.technique_craft_links WHERE technique_id = $2
         ON CONFLICT DO NOTHING`,
        [mergeIntoId, id],
      );

      await this.repo.query(
        `UPDATE artesanos.artisan_identity SET technique_primary_id = $1 WHERE technique_primary_id = $2`,
        [mergeIntoId, id],
      );
      await this.repo.query(
        `UPDATE artesanos.artisan_identity SET technique_secondary_id = $1 WHERE technique_secondary_id = $2`,
        [mergeIntoId, id],
      );
      await this.repo.query(
        `UPDATE shop.product_artisanal_identity SET primary_technique_id = $1 WHERE primary_technique_id = $2`,
        [mergeIntoId, id],
      );
      await this.repo.query(
        `UPDATE shop.product_artisanal_identity SET secondary_technique_id = $1 WHERE secondary_technique_id = $2`,
        [mergeIntoId, id],
      );
      await this.repo.update(id, { status: ApprovalStatus.REJECTED });
      return { message: `Técnica fusionada en ${mergeIntoId}` };
    }

    await this.repo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: `Técnica con ID ${id} eliminada exitosamente` };
  }
}
