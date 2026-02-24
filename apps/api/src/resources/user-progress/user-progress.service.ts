import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UserAchievement } from '../user-achievements/entities/user-achievement.entity';
import { UserMaturityScore } from '../user-maturity-scores/entities/user-maturity-score.entity';

@Injectable()
export class UserProgressService {
  private readonly logger = new Logger(UserProgressService.name);

  constructor(
    @Inject('USER_PROGRESS_REPOSITORY')
    private readonly userProgressRepository: Repository<UserProgress>,
    @Inject('USER_ACHIEVEMENTS_REPOSITORY')
    private readonly userAchievementsRepository: Repository<UserAchievement>,
    @Inject('USER_MATURITY_SCORES_REPOSITORY')
    private readonly userMaturityScoresRepository: Repository<UserMaturityScore>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crear un nuevo registro de progreso
   */
  async create(createDto: CreateUserProgressDto): Promise<UserProgress> {
    // Verificar si ya existe un progreso para este usuario
    const existingProgress = await this.userProgressRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existingProgress) {
      throw new ConflictException(
        'Ya existe un registro de progreso para este usuario',
      );
    }

    const newProgress = this.userProgressRepository.create(createDto);
    return await this.userProgressRepository.save(newProgress);
  }

  /**
   * Obtener todos los registros de progreso
   */
  async getAll(): Promise<UserProgress[]> {
    return await this.userProgressRepository.find({
      relations: ['userProfile'],
      order: { level: 'DESC', experiencePoints: 'DESC' },
    });
  }

  /**
   * Obtener un registro de progreso por ID
   */
  async getById(id: string): Promise<UserProgress> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const progress = await this.userProgressRepository.findOne({
      where: { id },
      relations: ['userProfile'],
    });

    if (!progress) {
      throw new NotFoundException(`Progreso con ID ${id} no encontrado`);
    }

    return progress;
  }

  /**
   * Obtener progreso por userId
   */
  async getByUserId(userId: string): Promise<UserProgress | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.userProgressRepository.findOne({
      where: { userId },
      relations: ['userProfile'],
    });
  }

  /**
   * Actualizar un registro de progreso
   */
  async update(
    id: string,
    updateDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    // Verificar que el progreso existe
    await this.getById(id);

    // Actualizar (el trigger actualizará updated_at automáticamente)
    await this.userProgressRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un registro de progreso
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que el progreso existe
    await this.getById(id);

    // Eliminar (hard delete)
    await this.userProgressRepository.delete(id);

    return {
      message: `Progreso con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Incrementar puntos de experiencia
   */
  async addExperience(userId: string, points: number): Promise<UserProgress> {
    const progress = await this.getByUserId(userId);

    if (!progress) {
      throw new NotFoundException(
        `No se encontró progreso para el usuario ${userId}`,
      );
    }

    progress.experiencePoints += points;

    // Verificar si sube de nivel
    while (progress.experiencePoints >= progress.nextLevelXp) {
      progress.experiencePoints -= progress.nextLevelXp;
      progress.level += 1;
      // Aumentar XP necesario para el próximo nivel (por ejemplo, +50 cada nivel)
      progress.nextLevelXp = 100 + (progress.level - 1) * 50;
    }

    await this.userProgressRepository.save(progress);
    return progress;
  }

  /**
   * Completar una misión
   */
  async completeMission(userId: string): Promise<UserProgress> {
    const progress = await this.getByUserId(userId);

    if (!progress) {
      throw new NotFoundException(
        `No se encontró progreso para el usuario ${userId}`,
      );
    }

    progress.completedMissions += 1;
    await this.userProgressRepository.save(progress);
    return progress;
  }

  /**
   * Actualizar racha de actividad
   */
  async updateStreak(userId: string): Promise<UserProgress> {
    const progress = await this.getByUserId(userId);

    if (!progress) {
      throw new NotFoundException(
        `No se encontró progreso para el usuario ${userId}`,
      );
    }

    const today = new Date();
    const lastActivity = progress.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null;

    if (lastActivity) {
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // Día consecutivo
        progress.currentStreak += 1;
        if (progress.currentStreak > progress.longestStreak) {
          progress.longestStreak = progress.currentStreak;
        }
      } else if (daysDiff > 1) {
        // Se rompió la racha
        progress.currentStreak = 1;
      }
      // Si daysDiff === 0, ya se registró hoy, no hacer nada
    } else {
      // Primera actividad
      progress.currentStreak = 1;
      progress.longestStreak = 1;
    }

    progress.lastActivityDate = today;
    await this.userProgressRepository.save(progress);
    return progress;
  }

  /**
   * Agregar tiempo invertido (en minutos)
   */
  async addTimeSpent(userId: string, minutes: number): Promise<UserProgress> {
    const progress = await this.getByUserId(userId);

    if (!progress) {
      throw new NotFoundException(
        `No se encontró progreso para el usuario ${userId}`,
      );
    }

    progress.totalTimeSpent += minutes;
    await this.userProgressRepository.save(progress);
    return progress;
  }

  /**
   * Obtener ranking de usuarios por nivel
   */
  async getLeaderboard(limit: number = 10): Promise<UserProgress[]> {
    return await this.userProgressRepository.find({
      relations: ['userProfile'],
      order: { level: 'DESC', experiencePoints: 'DESC' },
      take: limit,
    });
  }

  /**
   * MÉTODO PRINCIPAL: Actualizar progreso completo del usuario
   * Replica la lógica de la Edge Function update-user-progress
   */
  async updateProgress(userId: string, dto: UpdateProgressDto): Promise<any> {
    try {
      // PASO 1: Obtener o crear progreso (UPSERT pattern)
      let currentProgress = await this.userProgressRepository.findOne({
        where: { userId },
      });

      if (!currentProgress) {


        currentProgress = this.userProgressRepository.create({
          userId,
          experiencePoints: 0,
          level: 1,
          completedMissions: 0,
          nextLevelXp: 100,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0,
        });

        currentProgress = await this.userProgressRepository.save(
          currentProgress,
        );
      }

      // PASO 2: Calcular nuevos valores
      let newXP = currentProgress.experiencePoints + dto.xpGained;
      let newLevel = currentProgress.level;
      let nextLevelXP = currentProgress.nextLevelXp;
      let leveledUp = false;
      const levelsGained: number[] = [];

      // Verificar si sube de nivel (puede subir múltiples niveles)
      while (newXP >= nextLevelXP) {
        newLevel++;
        newXP -= nextLevelXP;
        nextLevelXP = this.calculateNextLevelXP(newLevel);
        leveledUp = true;
        levelsGained.push(newLevel);
      }

      // PASO 3: Actualizar racha usando función de base de datos
      const streakResult = await this.dataSource.query(
        `SELECT * FROM update_user_streak($1)`,
        [userId],
      );

      const streakData = streakResult[0] || {
        current_streak: 0,
        longest_streak: 0,
      };

      // PASO 4: Preparar datos de actualización
      const updateData: any = {
        experiencePoints: newXP,
        level: newLevel,
        nextLevelXp: nextLevelXP,
        totalTimeSpent: currentProgress.totalTimeSpent + (dto.timeSpent || 0),
        currentStreak: streakData.current_streak,
        longestStreak: streakData.longest_streak,
      };

      if (dto.missionCompleted) {
        updateData.completedMissions = currentProgress.completedMissions + 1;
      }

      // Actualizar progreso
      await this.userProgressRepository.update(
        { userId },
        updateData,
      );

      // PASO 5: Verificar y desbloquear logros
      const unlockedAchievements = await this.checkAndUnlockAchievements(
        userId,
        {
          ...updateData,
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
        },
      );



      // PASO 6: Retornar respuesta completa
      return {
        success: true,
        data: {
          level: newLevel,
          experiencePoints: newXP,
          nextLevelXP,
          leveledUp,
          levelsGained,
          completedMissions:
            updateData.completedMissions || currentProgress.completedMissions,
          currentStreak: streakData.current_streak,
          longestStreak: streakData.longest_streak,
          unlockedAchievements,
        },
      };
    } catch (error) {
      this.logger.error(`[UpdateProgress] Error: ${error.message}`);
      throw new InternalServerErrorException(
        'Error al actualizar progreso del usuario',
      );
    }
  }

  /**
   * Calcular XP necesario para el próximo nivel
   * Fórmula: 100 * 1.5^(level-1)
   */
  private calculateNextLevelXP(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Verificar y desbloquear logros automáticamente
   */
  private async checkAndUnlockAchievements(
    userId: string,
    progress: any,
  ): Promise<any[]> {
    const newAchievements: any[] = [];

    try {
      // Obtener logros ya desbloqueados
      const unlockedIds = await this.userAchievementsRepository.find({
        where: { userId },
        select: ['achievementId'],
      });

      const alreadyUnlocked = new Set(
        unlockedIds.map((a) => a.achievementId),
      );

      // Obtener catálogo de logros desde la base de datos
      const catalog = await this.dataSource.query(
        `SELECT * FROM artesanos.achievements_catalog`,
      );

      if (!catalog || catalog.length === 0) {
        this.logger.warn(
          `[CheckAchievements] No achievements catalog found`,
        );
        return [];
      }

      // Verificar cada logro
      for (const achievement of catalog) {
        if (alreadyUnlocked.has(achievement.id)) continue;

        const criteria = achievement.unlock_criteria;
        let shouldUnlock = false;

        switch (criteria.type) {
          case 'missions_completed':
            shouldUnlock = progress.completedMissions >= criteria.count;
            break;

          case 'level_reached':
            shouldUnlock = progress.level >= criteria.level;
            break;

          case 'streak_reached':
            shouldUnlock = progress.current_streak >= criteria.days;
            break;

          case 'onboarding_complete':
            // Verificar si existe maturity score
            const maturityData =
              await this.userMaturityScoresRepository.findOne({
                where: { userId },
              });
            shouldUnlock = !!maturityData;
            break;
        }

        if (shouldUnlock) {
          // Intentar desbloquear el logro
          try {
            const newAchievement = this.userAchievementsRepository.create({
              userId,
              achievementId: achievement.id,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
            });

            await this.userAchievementsRepository.save(newAchievement);

            newAchievements.push({
              id: achievement.id,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
            });

          } catch (error) {
            // Si hay error (posiblemente duplicado), continuar con el siguiente
            this.logger.warn(
              `[CheckAchievements] Could not unlock ${achievement.id}: ${error.message}`,
            );
          }
        }
      }

      return newAchievements;
    } catch (error) {
      this.logger.error(
        `[CheckAchievements] Error checking achievements: ${error.message}`,
      );
      return [];
    }
  }
}
