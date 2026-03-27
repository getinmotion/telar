import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('CATEGORIES_REPOSITORY')
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  /**
   * Crear una nueva categoría
   */
  async create(createDto: CreateCategoryDto): Promise<Category> {
    // Verificar si ya existe una categoría con ese slug
    const existingCategory = await this.categoriesRepository.findOne({
      where: { slug: createDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con ese slug');
    }

    const newCategory = this.categoriesRepository.create(createDto);
    return await this.categoriesRepository.save(newCategory);
  }

  /**
   * Obtener todas las categorías
   */
  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      relations: ['parent'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener una categoría por ID
   */
  async findOne(id: string): Promise<Category> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  /**
   * Obtener categorías activas
   */
  async findActive(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['parent'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener categorías por parent ID
   */
  async findByParent(parentId: string): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { parentId },
      relations: ['parent'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Actualizar una categoría
   */
  async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Si se está actualizando el slug, verificar que no exista otro con ese slug
    if (updateDto.slug) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { slug: updateDto.slug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese slug');
      }
    }

    // Actualizar
    await this.categoriesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una categoría
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que la categoría existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.categoriesRepository.delete(id);

    return {
      message: `Categoría con ID ${id} eliminada exitosamente`,
    };
  }
}
