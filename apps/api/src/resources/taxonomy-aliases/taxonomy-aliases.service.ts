import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { TaxonomyAlias, TaxonomyAliasType } from './entities/taxonomy-alias.entity';
import { CreateTaxonomyAliasDto } from './dto/create-taxonomy-alias.dto';

@Injectable()
export class TaxonomyAliasesService {
  constructor(
    @Inject('TAXONOMY_ALIASES_REPOSITORY')
    private readonly repo: Repository<TaxonomyAlias>,
  ) {}

  async create(dto: CreateTaxonomyAliasDto): Promise<TaxonomyAlias> {
    const alias = this.repo.create(dto);
    return this.repo.save(alias);
  }

  async findAll(): Promise<TaxonomyAlias[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByCanonicalId(canonicalId: string): Promise<TaxonomyAlias[]> {
    if (!canonicalId) throw new BadRequestException('canonicalId es requerido');
    return this.repo.find({ where: { canonicalId }, order: { createdAt: 'DESC' } });
  }

  async findByType(type: TaxonomyAliasType): Promise<TaxonomyAlias[]> {
    return this.repo.find({ where: { canonicalType: type }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TaxonomyAlias> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const alias = await this.repo.findOne({ where: { id } });
    if (!alias) throw new NotFoundException(`Alias con ID ${id} no encontrado`);
    return alias;
  }

  async remove(id: string): Promise<void> {
    const alias = await this.findOne(id);
    await this.repo.remove(alias);
  }
}
