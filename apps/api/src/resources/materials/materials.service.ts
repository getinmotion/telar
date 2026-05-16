import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { Material, ApprovalStatus } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @Inject('MATERIALS_REPOSITORY')
    private readonly materialsRepository: Repository<Material>,
  ) {}

  /**
   * Crear un nuevo material
   */
  async create(createDto: CreateMaterialDto): Promise<Material> {
    // Verificar si ya existe un material con ese nombre
    const existingMaterial = await this.materialsRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingMaterial) {
      throw new ConflictException('Ya existe un material con ese nombre');
    }

    const newMaterial = this.materialsRepository.create(createDto);
    return await this.materialsRepository.save(newMaterial);
  }

  async findAll(search?: string, status?: string, suggestedBy?: string): Promise<Material[]> {
    const where: any = {};
    if (status) where.status = status;
    if (suggestedBy) where.suggestedBy = suggestedBy;
    if (search) where.name = ILike(`%${search}%`);
    return this.materialsRepository.find({ where, order: { name: 'ASC' } });
  }

  /**
   * Obtener un material por ID
   */
  async findOne(id: string): Promise<Material> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const material = await this.materialsRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    return material;
  }

  async findOrganic(): Promise<Material[]> {
    return this.materialsRepository.find({
      where: { isOrganic: true, status: ApprovalStatus.APPROVED },
      order: { name: 'ASC' },
    });
  }

  async findSustainable(): Promise<Material[]> {
    return this.materialsRepository.find({
      where: { isSustainable: true, status: ApprovalStatus.APPROVED },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: string): Promise<Material[]> {
    return this.materialsRepository.find({
      where: { status: status as ApprovalStatus },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdateMaterialDto): Promise<Material> {
    await this.findOne(id);

    if (updateDto.name) {
      const existingMaterial = await this.materialsRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingMaterial && existingMaterial.id !== id) {
        throw new ConflictException('Ya existe un material con ese nombre');
      }
    }

    await this.materialsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: ApprovalStatus,
    mergeIntoId?: string,
  ): Promise<Material | { message: string }> {
    await this.findOne(id);

    if (mergeIntoId && status === ApprovalStatus.REJECTED) {
      await this.findOne(mergeIntoId);
      await this.materialsRepository.query(
        `UPDATE artesanos.artisan_materials SET material_id = $1 WHERE material_id = $2`,
        [mergeIntoId, id],
      );
      await this.materialsRepository.update(id, { status: ApprovalStatus.REJECTED });
      return { message: `Material fusionado en ${mergeIntoId}` };
    }

    await this.materialsRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.materialsRepository.delete(id);
    return { message: `Material con ID ${id} eliminado exitosamente` };
  }
}
