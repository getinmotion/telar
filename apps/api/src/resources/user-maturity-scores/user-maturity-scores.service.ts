import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserMaturityScore } from './entities/user-maturity-score.entity';
import { CreateUserMaturityScoreDto } from './dto/create-user-maturity-score.dto';
import { UpdateUserMaturityScoreDto } from './dto/update-user-maturity-score.dto';

@Injectable()
export class UserMaturityScoresService {
  constructor(
    @Inject('USER_MATURITY_SCORES_REPOSITORY')
    private readonly scoresRepository: Repository<UserMaturityScore>,
  ) {}

  /**
   * Crear un nuevo score de madurez
   */
  async create(
    createDto: CreateUserMaturityScoreDto,
  ): Promise<UserMaturityScore> {
    const newScore = this.scoresRepository.create(createDto);
    return await this.scoresRepository.save(newScore);
  }

  /**
   * Obtener todos los scores
   */
  async getAll(): Promise<UserMaturityScore[]> {
    return await this.scoresRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un score por ID
   */
  async getById(id: string): Promise<UserMaturityScore> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const score = await this.scoresRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!score) {
      throw new NotFoundException(`Score con ID ${id} no encontrado`);
    }

    return score;
  }

  /**
   * Obtener todos los scores de un usuario (histórico)
   */
  async getByUserId(userId: string): Promise<UserMaturityScore[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.scoresRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener el score más reciente de un usuario
   */
  async getLatestByUserId(userId: string): Promise<UserMaturityScore | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const score = await this.scoresRepository.findOne({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return score;
  }

  /**
   * Obtener el score promedio de un usuario
   */
  async getAverageByUserId(
    userId: string,
  ): Promise<{
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
    totalAverage: number;
  }> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const scores = await this.scoresRepository.find({
      where: { userId },
    });

    if (scores.length === 0) {
      return {
        ideaValidation: 0,
        userExperience: 0,
        marketFit: 0,
        monetization: 0,
        totalAverage: 0,
      };
    }

    const sum = scores.reduce(
      (acc, score) => ({
        ideaValidation: acc.ideaValidation + score.ideaValidation,
        userExperience: acc.userExperience + score.userExperience,
        marketFit: acc.marketFit + score.marketFit,
        monetization: acc.monetization + score.monetization,
      }),
      { ideaValidation: 0, userExperience: 0, marketFit: 0, monetization: 0 },
    );

    const count = scores.length;

    const averages = {
      ideaValidation: Math.round(sum.ideaValidation / count),
      userExperience: Math.round(sum.userExperience / count),
      marketFit: Math.round(sum.marketFit / count),
      monetization: Math.round(sum.monetization / count),
      totalAverage: 0,
    };

    averages.totalAverage = Math.round(
      (averages.ideaValidation +
        averages.userExperience +
        averages.marketFit +
        averages.monetization) /
        4,
    );

    return averages;
  }

  /**
   * Obtener la evolución de scores de un usuario (histórico con tendencias)
   */
  async getEvolutionByUserId(userId: string): Promise<{
    scores: UserMaturityScore[];
    trend: {
      ideaValidation: 'up' | 'down' | 'stable';
      userExperience: 'up' | 'down' | 'stable';
      marketFit: 'up' | 'down' | 'stable';
      monetization: 'up' | 'down' | 'stable';
      total: 'up' | 'down' | 'stable';
    };
  }> {
    const scores = await this.getByUserId(userId);

    if (scores.length < 2) {
      return {
        scores,
        trend: {
          ideaValidation: 'stable',
          userExperience: 'stable',
          marketFit: 'stable',
          monetization: 'stable',
          total: 'stable',
        },
      };
    }

    const latest = scores[0];
    const previous = scores[1];

    const calculateTrend = (latest: number, previous: number) => {
      const diff = latest - previous;
      if (diff > 5) return 'up';
      if (diff < -5) return 'down';
      return 'stable';
    };

    return {
      scores,
      trend: {
        ideaValidation: calculateTrend(
          latest.ideaValidation,
          previous.ideaValidation,
        ) as 'up' | 'down' | 'stable',
        userExperience: calculateTrend(
          latest.userExperience,
          previous.userExperience,
        ) as 'up' | 'down' | 'stable',
        marketFit: calculateTrend(
          latest.marketFit,
          previous.marketFit,
        ) as 'up' | 'down' | 'stable',
        monetization: calculateTrend(
          latest.monetization,
          previous.monetization,
        ) as 'up' | 'down' | 'stable',
        total: calculateTrend(
          latest.totalScore,
          previous.totalScore,
        ) as 'up' | 'down' | 'stable',
      },
    };
  }

  /**
   * Obtener estadísticas globales de madurez
   */
  async getGlobalStats(): Promise<{
    totalUsers: number;
    averageScores: {
      ideaValidation: number;
      userExperience: number;
      marketFit: number;
      monetization: number;
      total: number;
    };
  }> {
    const result = await this.scoresRepository
      .createQueryBuilder('score')
      .select('COUNT(DISTINCT score.user_id)', 'totalUsers')
      .addSelect('ROUND(AVG(score.idea_validation))', 'avgIdeaValidation')
      .addSelect('ROUND(AVG(score.user_experience))', 'avgUserExperience')
      .addSelect('ROUND(AVG(score.market_fit))', 'avgMarketFit')
      .addSelect('ROUND(AVG(score.monetization))', 'avgMonetization')
      .getRawOne();

    const avgTotal = Math.round(
      (Number(result.avgIdeaValidation) +
        Number(result.avgUserExperience) +
        Number(result.avgMarketFit) +
        Number(result.avgMonetization)) /
        4,
    );

    return {
      totalUsers: Number(result.totalUsers),
      averageScores: {
        ideaValidation: Number(result.avgIdeaValidation),
        userExperience: Number(result.avgUserExperience),
        marketFit: Number(result.avgMarketFit),
        monetization: Number(result.avgMonetization),
        total: avgTotal,
      },
    };
  }

  /**
   * Actualizar un score
   */
  async update(
    id: string,
    updateDto: UpdateUserMaturityScoreDto,
  ): Promise<UserMaturityScore> {
    await this.getById(id);

    await this.scoresRepository.update(id, updateDto);

    return await this.getById(id);
  }

  /**
   * Eliminar un score
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);

    await this.scoresRepository.delete(id);

    return {
      message: `Score con ID ${id} eliminado exitosamente`,
    };
  }
}
