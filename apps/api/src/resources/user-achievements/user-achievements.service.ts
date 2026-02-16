import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserAchievement } from './entities/user-achievement.entity';
import { CreateUserAchievementDto } from './dto/create-user-achievement.dto';
import { UpdateUserAchievementDto } from './dto/update-user-achievement.dto';

@Injectable()
export class UserAchievementsService {
  private readonly logger = new Logger(UserAchievementsService.name);

  constructor(
    @Inject('USER_ACHIEVEMENTS_REPOSITORY')
    private readonly userAchievementsRepository: Repository<UserAchievement>,
  ) {}

  /**
   * Crear un nuevo logro de usuario
   */
  async create(
    createUserAchievementDto: CreateUserAchievementDto,
  ): Promise<UserAchievement> {
    // Validar que no exista el mismo logro para el usuario (unique constraint)
    const existing = await this.userAchievementsRepository.findOne({
      where: {
        userId: createUserAchievementDto.userId,
        achievementId: createUserAchievementDto.achievementId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ya tiene el logro ${createUserAchievementDto.achievementId}`,
      );
    }

    const newAchievement = this.userAchievementsRepository.create(
      createUserAchievementDto,
    );
    return await this.userAchievementsRepository.save(newAchievement);
  }

  /**
   * Obtener todos los logros de usuarios
   */
  async getAll(): Promise<UserAchievement[]> {
    return await this.userAchievementsRepository.find({
      order: { unlockedAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Obtener un logro por ID
   */
  async getById(id: string): Promise<UserAchievement> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const achievement = await this.userAchievementsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${id} no encontrado`);
    }

    return achievement;
  }

  /**
   * Obtener logros por usuario
   */
  async getByUserId(userId: string): Promise<UserAchievement[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    return await this.userAchievementsRepository.find({
      where: { userId },
      order: { unlockedAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Obtener logros por achievementId
   */
  async getByAchievementId(achievementId: string): Promise<UserAchievement[]> {
    if (!achievementId) {
      throw new BadRequestException('El ID del logro es requerido');
    }

    return await this.userAchievementsRepository.find({
      where: { achievementId },
      order: { unlockedAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Verificar si un usuario tiene un logro específico
   */
  async hasAchievement(
    userId: string,
    achievementId: string,
  ): Promise<boolean> {
    if (!userId || !achievementId) {
      throw new BadRequestException(
        'El ID del usuario y el ID del logro son requeridos',
      );
    }

    const achievement = await this.userAchievementsRepository.findOne({
      where: { userId, achievementId },
    });

    return !!achievement;
  }

  /**
   * Actualizar un logro
   */
  async update(
    id: string,
    updateUserAchievementDto: UpdateUserAchievementDto,
  ): Promise<UserAchievement> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.userAchievementsRepository.update(id, updateUserAchievementDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un logro
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Hard delete
    await this.userAchievementsRepository.delete(id);

    return {
      message: `Logro con ID ${id} eliminado exitosamente`,
    };
  }
}
