import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CuratorialCategory } from './entities/curatorial-category.entity';
import { CreateCuratorialCategoryDto } from './dto/create-curatorial-category.dto';
import { UpdateCuratorialCategoryDto } from './dto/update-curatorial-category.dto';

@Injectable()
export class CuratorialCategoriesService {
  constructor(
    @Inject('CURATORIAL_CATEGORIES_REPOSITORY')
    private readonly curatorialCategoriesRepository: Repository<CuratorialCategory>,
  ) {}

  /**
   * Crear una nueva categoría curatorial
   */
  async create(
    createDto: CreateCuratorialCategoryDto,
  ): Promise<CuratorialCategory> {
    // Verificar si ya existe una categoría curatorial con ese nombre
    const existingCategory = await this.curatorialCategoriesRepository.findOne(
      {
        where: { name: createDto.name },
      },
    );

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría curatorial con ese nombre',
      );
    }

    const newCategory = this.curatorialCategoriesRepository.create(createDto);
    return await this.curatorialCategoriesRepository.save(newCategory);
  }

  /**
   * Obtener todas las categorías curatoriales
   */
  async findAll(): Promise<CuratorialCategory[]> {
    return await this.curatorialCategoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener una categoría curatorial por ID
   */
  async findOne(id: string): Promise<CuratorialCategory> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const category = await this.curatorialCategoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría curatorial con ID ${id} no encontrada`,
      );
    }

    return category;
  }

  /**
   * Actualizar una categoría curatorial
   */
  async update(
    id: string,
    updateDto: UpdateCuratorialCategoryDto,
  ): Promise<CuratorialCategory> {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateDto.name) {
      const existingCategory =
        await this.curatorialCategoriesRepository.findOne({
          where: { name: updateDto.name },
        });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          'Ya existe una categoría curatorial con ese nombre',
        );
      }
    }

    // Actualizar
    await this.curatorialCategoriesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una categoría curatorial
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.curatorialCategoriesRepository.delete(id);

    return {
      message: `Categoría curatorial con ID ${id} eliminada exitosamente`,
    };
  }
}
