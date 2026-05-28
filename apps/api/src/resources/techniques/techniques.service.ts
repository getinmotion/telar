import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { Technique, ApprovalStatus } from './entities/technique.entity';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { ProductArtisanalIdentity } from '../products-new/entities/product-artisanal-identity.entity';

@Injectable()
export class TechniquesService {
  constructor(
    @Inject('TECHNIQUES_REPOSITORY')
    private readonly techniquesRepository: Repository<Technique>,
  ) {}

  /**
   * Crear una nueva técnica
   */
  async create(createDto: CreateTechniqueDto): Promise<Technique> {
    // Verificar si ya existe una técnica con ese nombre para el mismo craft
    const existingTechnique = await this.techniquesRepository.findOne({
      where: { name: createDto.name, craftId: createDto.craftId },
    });

    if (existingTechnique) {
      throw new ConflictException(
        'Ya existe una técnica con ese nombre para este craft',
      );
    }

    const newTechnique = this.techniquesRepository.create(createDto);
    return await this.techniquesRepository.save(newTechnique);
  }

  async findAll(search?: string, status?: string, suggestedBy?: string): Promise<Technique[]> {
    const where: any = {};
    if (status) where.status = status;
    if (suggestedBy) where.suggestedBy = suggestedBy;
    if (search) where.name = ILike(`%${search}%`);
    return this.techniquesRepository.find({ where, order: { name: 'ASC' } });
  }

  /**
   * Obtener técnicas con el conteo de productos asociados.
   * Acepta los mismos filtros que findAll (craftId, search, status).
   */
  async findAllWithProductCount(
    craftId?: string,
    search?: string,
    status?: string,
  ): Promise<Array<Technique & { productCount: number }>> {
    const where: any = {};
    if (craftId) where.craftId = craftId;
    if (status) where.status = status;
    if (search) where.name = ILike(`%${search}%`);

    const [items, countRows] = await Promise.all([
      this.techniquesRepository.find({ where, order: { name: 'ASC' } }),
      this.techniquesRepository
        .createQueryBuilder('t')
        .leftJoin(
          ProductArtisanalIdentity,
          'pai',
          '(pai.primary_technique_id = t.id OR pai.secondary_technique_id = t.id) AND pai.deleted_at IS NULL',
        )
        .select('t.id', 'id')
        .addSelect('COUNT(DISTINCT pai.product_id)::int', 'productCount')
        .where(craftId ? 't.craftId = :craftId' : '1=1', { craftId })
        .groupBy('t.id')
        .getRawMany<{ id: string; productCount: number }>(),
    ]);
    const countMap = new Map(countRows.map((r) => [r.id, Number(r.productCount) || 0]));
    return items.map((item) => ({ ...item, productCount: countMap.get(item.id) ?? 0 }));
  }

  /**
   * Obtener una técnica por ID
   */
  async findOne(id: string): Promise<Technique> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const technique = await this.techniquesRepository.findOne({
      where: { id },
    });

    if (!technique) {
      throw new NotFoundException(`Técnica con ID ${id} no encontrada`);
    }

    return technique;
  }

  async findByCraftId(craftId: string, status?: string): Promise<Technique[]> {
    const where: any = { craftId };
    if (status) where.status = status;
    return this.techniquesRepository.find({ where, order: { name: 'ASC' } });
  }

  async findByStatus(status: string): Promise<Technique[]> {
    return this.techniquesRepository.find({
      where: { status: status as ApprovalStatus },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdateTechniqueDto): Promise<Technique> {
    await this.findOne(id);

    if (updateDto.name || updateDto.craftId) {
      const technique = await this.findOne(id);
      const nameToCheck = updateDto.name || technique.name;
      const craftIdToCheck = updateDto.craftId || technique.craftId;

      const existingTechnique = await this.techniquesRepository.findOne({
        where: { name: nameToCheck, craftId: craftIdToCheck },
      });

      if (existingTechnique && existingTechnique.id !== id) {
        throw new ConflictException(
          'Ya existe una técnica con ese nombre para este craft',
        );
      }
    }

    await this.techniquesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    mergeIntoId?: string,
  ): Promise<Technique | { message: string }> {
    await this.findOne(id);

    if (mergeIntoId && status === ApprovalStatus.REJECTED) {
      await this.findOne(mergeIntoId);
      await this.techniquesRepository.query(
        `UPDATE artesanos.artisan_identity SET technique_primary_id = $1 WHERE technique_primary_id = $2`,
        [mergeIntoId, id],
      );
      await this.techniquesRepository.query(
        `UPDATE artesanos.artisan_identity SET technique_secondary_id = $1 WHERE technique_secondary_id = $2`,
        [mergeIntoId, id],
      );
      await this.techniquesRepository.query(
        `UPDATE shop.product_artisanal_identity SET primary_technique_id = $1 WHERE primary_technique_id = $2`,
        [mergeIntoId, id],
      );
      await this.techniquesRepository.query(
        `UPDATE shop.product_artisanal_identity SET secondary_technique_id = $1 WHERE secondary_technique_id = $2`,
        [mergeIntoId, id],
      );
      await this.techniquesRepository.update(id, { status: ApprovalStatus.REJECTED });
      return { message: `Técnica fusionada en ${mergeIntoId}` };
    }

    await this.techniquesRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.techniquesRepository.delete(id);
    return { message: `Técnica con ID ${id} eliminada exitosamente` };
  }
}
