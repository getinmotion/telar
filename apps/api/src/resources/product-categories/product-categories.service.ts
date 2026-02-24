import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @Inject('PRODUCT_CATEGORIES_REPOSITORY')
    private readonly productCategoriesRepository: Repository<ProductCategory>,
  ) {}

  /**
   * Crear una nueva categoría
   */
  async create(
    createDto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    // Verificar si ya existe una categoría con ese slug
    const existingSlug = await this.productCategoriesRepository.findOne({
      where: { slug: createDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `Ya existe una categoría con el slug ${createDto.slug}`,
      );
    }

    // Si tiene parent_id, verificar que existe
    if (createDto.parentId) {
      const parentExists = await this.productCategoriesRepository.findOne({
        where: { id: createDto.parentId },
      });

      if (!parentExists) {
        throw new NotFoundException(
          `Categoría padre con ID ${createDto.parentId} no encontrada`,
        );
      }
    }

    const newCategory = this.productCategoriesRepository.create(createDto);
    return await this.productCategoriesRepository.save(newCategory);
  }

  /**
   * Obtener todas las categorías
   */
  async getAll(): Promise<ProductCategory[]> {
    return await this.productCategoriesRepository.find({
      relations: ['parent', 'children'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener una categoría por ID
   */
  async getById(id: string): Promise<ProductCategory> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const category = await this.productCategoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  /**
   * Obtener una categoría por slug
   */
  async getBySlug(slug: string): Promise<ProductCategory> {
    if (!slug) {
      throw new BadRequestException('El slug es requerido');
    }

    const category = await this.productCategoriesRepository.findOne({
      where: { slug },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con slug ${slug} no encontrada`);
    }

    return category;
  }

  /**
   * Obtener categorías raíz (sin padre)
   */
  async getRootCategories(): Promise<ProductCategory[]> {
    return await this.productCategoriesRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener subcategorías de una categoría
   */
  async getChildren(parentId: string): Promise<ProductCategory[]> {
    return await this.productCategoriesRepository.find({
      where: { parentId },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener categorías activas
   */
  async getActive(): Promise<ProductCategory[]> {
    return await this.productCategoriesRepository.find({
      where: { isActive: true },
      relations: ['children'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener árbol de categorías jerárquico
   */
  async getCategoryTree(): Promise<ProductCategory[]> {
    // Obtener todas las categorías raíz con sus hijos
    const rootCategories = await this.productCategoriesRepository.find({
      where: { parentId: IsNull() },
      relations: ['children', 'children.children'],
      order: { displayOrder: 'ASC' },
    });

    return rootCategories;
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    updateDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    // Verificar que existe
    await this.getById(id);

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (updateDto.slug) {
      const existingSlug = await this.productCategoriesRepository.findOne({
        where: { slug: updateDto.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          `Ya existe otra categoría con el slug ${updateDto.slug}`,
        );
      }
    }

    // Si se actualiza el parentId, verificar que existe
    if (updateDto.parentId) {
      // Evitar que una categoría sea su propio padre
      if (updateDto.parentId === id) {
        throw new BadRequestException(
          'Una categoría no puede ser su propio padre',
        );
      }

      const parentExists = await this.productCategoriesRepository.findOne({
        where: { id: updateDto.parentId },
      });

      if (!parentExists) {
        throw new NotFoundException(
          `Categoría padre con ID ${updateDto.parentId} no encontrada`,
        );
      }
    }

    // Actualizar
    await this.productCategoriesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar una categoría
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    const category = await this.getById(id);

    // Verificar si tiene subcategorías
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías. Elimina primero las subcategorías.',
      );
    }

    // Verificar si tiene productos
    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene productos asignados. Reasigna primero los productos.',
      );
    }

    // Eliminar
    await this.productCategoriesRepository.delete(id);

    return {
      message: `Categoría con ID ${id} eliminada exitosamente`,
    };
  }
}
