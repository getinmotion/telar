import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'artisan_origin', schema: 'artesanos' })
export class ArtisanOrigin extends BaseEntity {
  @ApiProperty({ description: 'ID único del origen del artesano' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'Historia de origen del artesano',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'origin_story' })
  originStory: string | null;

  @ApiPropertyOptional({
    description: 'Historia cultural del artesano',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'cultural_story' })
  culturalStory: string | null;

  @ApiPropertyOptional({
    description: 'Historia principal del artesano',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'main_story' })
  mainStory: string | null;

  @ApiPropertyOptional({
    description: 'Significado cultural de la artesanía',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'cultural_meaning' })
  culturalMeaning: string | null;

  @ApiPropertyOptional({
    description: 'Detalle de quién aprendió el oficio',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'learned_from_detail' })
  learnedFromDetail: string | null;

  @ApiPropertyOptional({
    description: 'Conocimiento ancestral transmitido',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'ancestral_knowledge' })
  ancestralKnowledge: string | null;

  @ApiPropertyOptional({
    description: 'De quién aprendió el oficio',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'learned_from' })
  learnedFrom: string | null;

  @ApiPropertyOptional({
    description: 'Edad a la que comenzó en la artesanía',
    type: Number,
    example: 15,
  })
  @Column({ type: 'smallint', nullable: true, name: 'start_age' })
  startAge: number | null;

  @ApiPropertyOptional({
    description: 'Relación con grupo étnico',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'ethnic_relation' })
  ethnicRelation: string | null;

  @ApiPropertyOptional({
    description: 'Cita o frase representativa del artesano',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'artisan_quote' })
  artisanQuote: string | null;

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
