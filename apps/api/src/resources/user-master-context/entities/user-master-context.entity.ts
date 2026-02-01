import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'user_master_context', schema: 'public' })
export class UserMasterContext extends BaseEntity {
  @ApiProperty({ description: 'ID único del contexto maestro' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ApiPropertyOptional({
    description: 'Contexto de negocio del usuario',
    example: {
      industry: 'Artesanías',
      businessSize: 'small',
      yearsInBusiness: 5,
    },
  })
  @Column({ type: 'jsonb', name: 'business_context', default: '{}' })
  businessContext: object;

  @ApiPropertyOptional({
    description: 'Preferencias del usuario',
    example: {
      theme: 'light',
      notifications: true,
      emailFrequency: 'weekly',
    },
  })
  @Column({ type: 'jsonb', default: '{}' })
  preferences: object;

  @ApiPropertyOptional({
    description: 'Insights de conversaciones con el usuario',
    example: {
      commonTopics: ['marketing', 'ventas'],
      sentiment: 'positive',
    },
  })
  @Column({ type: 'jsonb', name: 'conversation_insights', default: '{}' })
  conversationInsights: object;

  @ApiPropertyOptional({
    description: 'Detalles técnicos del usuario',
    example: {
      hasWebsite: true,
      usesSocialMedia: ['Instagram', 'Facebook'],
    },
  })
  @Column({ type: 'jsonb', name: 'technical_details', default: '{}' })
  technicalDetails: object;

  @ApiPropertyOptional({
    description: 'Metas y objetivos del usuario',
    example: {
      shortTerm: 'Aumentar ventas 20%',
      longTerm: 'Expandir a otros mercados',
    },
  })
  @Column({ type: 'jsonb', name: 'goals_and_objectives', default: '{}' })
  goalsAndObjectives: object;

  @ApiPropertyOptional({
    description: 'Versión del contexto',
    example: 1,
    default: 1,
  })
  @Column({ type: 'integer', name: 'context_version', nullable: true, default: 1 })
  contextVersion: number | null;

  @ApiPropertyOptional({
    description: 'Fecha de última actualización del contexto',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'last_updated' })
  lastUpdated: Date;

  @ApiProperty({ description: 'Fecha de creación del contexto' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Perfil de negocio del usuario',
    example: {
      targetMarket: 'Nacional',
      productCategories: ['Cerámica', 'Textiles'],
    },
  })
  @Column({ type: 'jsonb', name: 'business_profile', default: '{}' })
  businessProfile: object;

  @ApiPropertyOptional({
    description: 'Contexto para generación de tareas',
    example: {
      priorityAreas: ['marketing', 'operaciones'],
      currentChallenges: ['bajo tráfico web'],
    },
  })
  @Column({ type: 'jsonb', name: 'task_generation_context', default: '{}' })
  taskGenerationContext: object;

  @ApiPropertyOptional({
    description: 'Preferencia de idioma',
    example: 'es',
    default: 'es',
  })
  @Column({ type: 'text', name: 'language_preference', nullable: true, default: 'es' })
  languagePreference: string | null;

  @ApiPropertyOptional({
    description: 'Fecha del último assessment',
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'last_assessment_date',
    nullable: true,
    default: () => 'now()',
  })
  lastAssessmentDate: Date | null;

  // Relación 1:1 con User
  @ApiProperty({ description: 'Usuario asociado al contexto' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
