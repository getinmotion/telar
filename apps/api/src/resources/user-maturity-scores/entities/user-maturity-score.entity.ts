import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'user_maturity_scores', schema: 'public' })
@Check(
  'user_maturity_scores_idea_validation_check',
  '"idea_validation" >= 0 AND "idea_validation" <= 100',
)
@Check(
  'user_maturity_scores_user_experience_check',
  '"user_experience" >= 0 AND "user_experience" <= 100',
)
@Check(
  'user_maturity_scores_market_fit_check',
  '"market_fit" >= 0 AND "market_fit" <= 100',
)
@Check(
  'user_maturity_scores_monetization_check',
  '"monetization" >= 0 AND "monetization" <= 100',
)
export class UserMaturityScore extends BaseEntity {
  @ApiProperty({ description: 'ID único del score de madurez' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del usuario' })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Usuario asociado' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Puntuación de validación de idea (0-100)',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @Column({ type: 'integer', name: 'idea_validation' })
  ideaValidation: number;

  @ApiProperty({
    description: 'Puntuación de experiencia de usuario (0-100)',
    minimum: 0,
    maximum: 100,
    example: 80,
  })
  @Column({ type: 'integer', name: 'user_experience' })
  userExperience: number;

  @ApiProperty({
    description: 'Puntuación de ajuste de mercado (0-100)',
    minimum: 0,
    maximum: 100,
    example: 65,
  })
  @Column({ type: 'integer', name: 'market_fit' })
  marketFit: number;

  @ApiProperty({
    description: 'Puntuación de monetización (0-100)',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @Column({ type: 'integer' })
  monetization: number;

  @ApiPropertyOptional({
    description: 'Datos del perfil en formato JSON',
    example: { stage: 'growth', industry: 'crafts' },
  })
  @Column({ type: 'jsonb', name: 'profile_data', nullable: true })
  profileData: Record<string, any> | null;

  @ApiProperty({ description: 'Fecha de creación del score' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  // Campo calculado: Score total (promedio de las 4 categorías)
  get totalScore(): number {
    return Math.round(
      (this.ideaValidation +
        this.userExperience +
        this.marketFit +
        this.monetization) /
        4,
    );
  }
}
