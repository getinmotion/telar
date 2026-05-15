import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { Craft, ApprovalStatus } from './entities/craft.entity';
import { CreateCraftDto } from './dto/create-craft.dto';
import { UpdateCraftDto } from './dto/update-craft.dto';

@Injectable()
export class CraftsService {
  constructor(
    @Inject('CRAFTS_REPOSITORY')
    private readonly craftsRepository: Repository<Craft>,
  ) {}

  /**
   * Crear un nuevo oficio
   */
  async create(createDto: CreateCraftDto): Promise<Craft> {
    // Verificar si ya existe un oficio con ese nombre
    const existingCraft = await this.craftsRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCraft) {
      throw new ConflictException('Ya existe un oficio con ese nombre');
    }

    const newCraft = this.craftsRepository.create(createDto);
    return await this.craftsRepository.save(newCraft);
  }

  async findAll(search?: string, status?: string, suggestedBy?: string): Promise<Craft[]> {
    const where: any = {};
    if (status) where.status = status;
    if (suggestedBy) where.suggestedBy = suggestedBy;
    if (search) where.name = ILike(`%${search}%`);
    return this.craftsRepository.find({ where, order: { name: 'ASC' } });
  }

  /**
   * Obtener un oficio por ID
   */
  async findOne(id: string): Promise<Craft> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const craft = await this.craftsRepository.findOne({
      where: { id },
    });

    if (!craft) {
      throw new NotFoundException(`Oficio con ID ${id} no encontrado`);
    }

    return craft;
  }

  async findActive(): Promise<Craft[]> {
    return this.craftsRepository.find({
      where: { isActive: true, status: ApprovalStatus.APPROVED },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: string): Promise<Craft[]> {
    return this.craftsRepository.find({
      where: { status: status as ApprovalStatus },
      order: { name: 'ASC' },
    });
  }

  async findByCategory(categoryId: string): Promise<Craft[]> {
    return this.craftsRepository.find({
      where: { categoryId, status: ApprovalStatus.APPROVED },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdateCraftDto): Promise<Craft> {
    await this.findOne(id);

    if (updateDto.name) {
      const existingCraft = await this.craftsRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingCraft && existingCraft.id !== id) {
        throw new ConflictException('Ya existe un oficio con ese nombre');
      }
    }

    await this.craftsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    mergeIntoId?: string,
  ): Promise<Craft | { message: string }> {
    await this.findOne(id);

    if (mergeIntoId && status === ApprovalStatus.REJECTED) {
      await this.findOne(mergeIntoId);
      await this.craftsRepository.query(
        `UPDATE taxonomy.techniques SET craft_id = $1 WHERE craft_id = $2`,
        [mergeIntoId, id],
      );
      await this.craftsRepository.update(id, { status: ApprovalStatus.REJECTED });
      return { message: `Oficio fusionado en ${mergeIntoId}` };
    }

    await this.craftsRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.craftsRepository.delete(id);
    return { message: `Oficio con ID ${id} eliminado exitosamente` };
  }
}
