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
import { Technique } from 'src/resources/techniques/entities/technique.entity';

@Entity({ name: 'artisan_identity', schema: 'artesanos' })
export class ArtisanIdentity extends BaseEntity {
  @ApiProperty({ description: 'ID único de la identidad artesanal' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'ID de la técnica primaria',
    type: String,
  })
  @Column({ type: 'uuid', nullable: true, name: 'technique_primary_id' })
  techniquePrimaryId: string | null;

  @ApiPropertyOptional({ description: 'Relación con la técnica primaria' })
  @ManyToOne(() => Technique, { nullable: true })
  @JoinColumn({ name: 'technique_primary_id' })
  techniquePrimary: Technique | null;

  @ApiPropertyOptional({
    description: 'ID de la técnica secundaria',
    type: String,
  })
  @Column({ type: 'uuid', nullable: true, name: 'technique_secondary_id' })
  techniqueSecondaryId: string | null;

  @ApiPropertyOptional({ description: 'Relación con la técnica secundaria' })
  @ManyToOne(() => Technique, { nullable: true })
  @JoinColumn({ name: 'technique_secondary_id' })
  techniqueSecondary: Technique | null;

  @ApiPropertyOptional({
    description: 'Mensaje del oficio artesanal',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'craft_message' })
  craftMessage: string | null;

  @ApiPropertyOptional({
    description: 'Motivación del artesano',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'motivation' })
  motivation: string | null;

  @ApiPropertyOptional({
    description: 'Aspectos únicos del trabajo artesanal',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'uniqueness' })
  uniqueness: string | null;

  @ApiPropertyOptional({
    description: 'Tiempo promedio de producción',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'average_time' })
  averageTime: string | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
