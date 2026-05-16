import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { Style, StyleStatus } from './entities/style.entity';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';

@Injectable()
export class TaxonomyStylesService {
  constructor(
    @Inject('STYLES_REPOSITORY')
    private readonly stylesRepo: Repository<Style>,
  ) {}

  async create(dto: CreateStyleDto): Promise<Style> {
    const existing = await this.stylesRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Ya existe un estilo con ese nombre');
    const style = this.stylesRepo.create(dto);
    return this.stylesRepo.save(style);
  }

  async findAll(search?: string, status?: string): Promise<Style[]> {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = ILike(`%${search}%`);
    return this.stylesRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Style> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const style = await this.stylesRepo.findOne({ where: { id } });
    if (!style) throw new NotFoundException(`Estilo con ID ${id} no encontrado`);
    return style;
  }

  async update(id: string, dto: UpdateStyleDto): Promise<Style> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.stylesRepo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== id) throw new ConflictException('Ya existe un estilo con ese nombre');
    }
    await this.stylesRepo.update(id, dto);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: StyleStatus, mergeIntoId?: string): Promise<Style | { message: string }> {
    await this.findOne(id);
    if (mergeIntoId && status === StyleStatus.REJECTED) {
      await this.findOne(mergeIntoId);
      // Reassign any junction records to the merge target
      await this.stylesRepo.query(
        `UPDATE artesanos.artisan_styles SET style_id = $1 WHERE style_id = $2`,
        [mergeIntoId, id],
      );
      await this.stylesRepo.update(id, { status: StyleStatus.REJECTED });
      return { message: `Estilo fusionado en ${mergeIntoId}` };
    }
    await this.stylesRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.stylesRepo.delete(id);
    return { message: `Estilo con ID ${id} eliminado` };
  }
}
