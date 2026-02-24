import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { BrandTheme } from './entities/brand-theme.entity';
import { CreateBrandThemeDto } from './dto/create-brand-theme.dto';
import { UpdateBrandThemeDto } from './dto/update-brand-theme.dto';

@Injectable()
export class BrandThemesService {
  constructor(
    @Inject('BRAND_THEMES_REPOSITORY')
    private readonly brandThemesRepository: Repository<BrandTheme>,
  ) {}

  /**
   * Crear un nuevo tema de marca
   */
  async create(createDto: CreateBrandThemeDto): Promise<BrandTheme> {
    // Verificar si ya existe un tema con ese themeId
    const existing = await this.brandThemesRepository.findOne({
      where: { themeId: createDto.themeId },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tema con el ID ${createDto.themeId}`,
      );
    }

    const newTheme = this.brandThemesRepository.create(createDto);
    return await this.brandThemesRepository.save(newTheme);
  }

  /**
   * Obtener todos los temas
   */
  async getAll(): Promise<BrandTheme[]> {
    return await this.brandThemesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un tema por ID
   */
  async getById(id: string): Promise<BrandTheme> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const theme = await this.brandThemesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!theme) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }

    return theme;
  }

  /**
   * Obtener un tema por themeId
   */
  async getByThemeId(themeId: string): Promise<BrandTheme> {
    if (!themeId) {
      throw new BadRequestException('El themeId es requerido');
    }

    const theme = await this.brandThemesRepository.findOne({
      where: { themeId },
      relations: ['user'],
    });

    if (!theme) {
      throw new NotFoundException(`Tema con themeId ${themeId} no encontrado`);
    }

    return theme;
  }

  /**
   * Obtener temas por userId
   */
  async getByUserId(userId: string): Promise<BrandTheme[]> {
    return await this.brandThemesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener temas activos
   */
  async getActive(): Promise<BrandTheme[]> {
    return await this.brandThemesRepository.find({
      where: { isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un tema
   */
  async update(id: string, updateDto: UpdateBrandThemeDto): Promise<BrandTheme> {
    // Verificar que existe
    await this.getById(id);

    // Si se actualiza el themeId, verificar que no exista otro con ese ID
    if (updateDto.themeId) {
      const existing = await this.brandThemesRepository.findOne({
        where: { themeId: updateDto.themeId },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otro tema con el ID ${updateDto.themeId}`,
        );
      }
    }

    // Actualizar
    await this.brandThemesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un tema
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar
    await this.brandThemesRepository.delete(id);

    return {
      message: `Tema con ID ${id} eliminado exitosamente`,
    };
  }
}
