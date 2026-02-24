import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

// Enums
export enum ActionType {
  SALE = 'sale',
  AGENT_USE = 'agent_use',
  TASK_COMPLETED = 'task_completed',
  CUSTOMER_INTERACTION = 'customer_interaction',
  MILESTONE = 'milestone',
  INCREMENT = 'increment',
}

export enum MaturityCategory {
  IDEA_VALIDATION = 'ideaValidation',
  USER_EXPERIENCE = 'userExperience',
  MARKET_FIT = 'marketFit',
  MONETIZATION = 'monetization',
}

@Entity({ name: 'user_maturity_actions', schema: 'public' })
export class UserMaturityAction extends BaseEntity {
  @ApiProperty({ description: 'ID único de la acción' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Tipo de acción realizada',
    enum: ActionType,
    example: ActionType.TASK_COMPLETED,
  })
  @Column({ type: 'text', name: 'action_type' })
  actionType: string;

  @ApiProperty({
    description: 'Categoría de madurez',
    enum: MaturityCategory,
    example: MaturityCategory.USER_EXPERIENCE,
  })
  @Column({ type: 'text' })
  category: string;

  @ApiProperty({
    description: 'Puntos otorgados por la acción (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'integer' })
  points: number;

  @ApiProperty({
    description: 'Descripción de la acción',
    example: 'Usuario completó la configuración de su tienda',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional de la acción',
    example: {
      taskId: '123',
      completionTime: 300,
      difficulty: 'medium',
    },
  })
  @Column({ type: 'jsonb', default: '{}' })
  metadata: object;

  @ApiProperty({ description: 'Fecha de creación de la acción' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  // Relación N:1 con User (muchas acciones pertenecen a un usuario)
  @ApiProperty({ description: 'Usuario asociado a la acción' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
