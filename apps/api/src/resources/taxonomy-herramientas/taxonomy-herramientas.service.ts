import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { Herramienta, HerramientaStatus } from './entities/herramienta.entity';
import { CreateHerramientaDto } from './dto/create-herramienta.dto';
import { UpdateHerramientaDto } from './dto/update-herramienta.dto';

@Injectable()
export class TaxonomyHerramientasService {
  constructor(
    @Inject('HERRAMIENTAS_REPOSITORY')
    private readonly herramientasRepo: Repository<Herramienta>,
  ) {}

  async create(dto: CreateHerramientaDto): Promise<Herramienta> {
    const existing = await this.herramientasRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Ya existe una herramienta con ese nombre');
    const herramienta = this.herramientasRepo.create(dto);
    return this.herramientasRepo.save(herramienta);
  }

  async findAll(search?: string, status?: string): Promise<Herramienta[]> {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = ILike(`%${search}%`);
    return this.herramientasRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Herramienta> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const h = await this.herramientasRepo.findOne({ where: { id } });
    if (!h) throw new NotFoundException(`Herramienta con ID ${id} no encontrada`);
    return h;
  }

  async update(id: string, dto: UpdateHerramientaDto): Promise<Herramienta> {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.herramientasRepo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== id) throw new ConflictException('Ya existe una herramienta con ese nombre');
    }
    await this.herramientasRepo.update(id, dto);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: HerramientaStatus, mergeIntoId?: string): Promise<Herramienta | { message: string }> {
    await this.findOne(id);
    if (mergeIntoId && status === HerramientaStatus.REJECTED) {
      await this.findOne(mergeIntoId);
      await this.herramientasRepo.query(
        `UPDATE artesanos.artisan_herramientas SET herramienta_id = $1 WHERE herramienta_id = $2`,
        [mergeIntoId, id],
      );
      await this.herramientasRepo.update(id, { status: HerramientaStatus.REJECTED });
      return { message: `Herramienta fusionada en ${mergeIntoId}` };
    }
    await this.herramientasRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.herramientasRepo.delete(id);
    return { message: `Herramienta con ID ${id} eliminada` };
  }
}
