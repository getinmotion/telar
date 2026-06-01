import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface FaqItem {
  q: string;
  a: string;
}

@Entity({ name: 'store_policies_config', schema: 'store' })
export class StorePoliciesConfig extends BaseEntity {
  @ApiProperty({ description: 'ID único del registro de políticas' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'Texto de la política de devoluciones',
    example: 'Aceptamos devoluciones dentro de los 30 días...',
  })
  @Column({ type: 'text', name: 'return_policy', nullable: true })
  returnPolicy: string | null;

  @ApiPropertyOptional({
    description: 'Preguntas frecuentes de la tienda',
    example: [{ q: '¿Hacen envíos internacionales?', a: 'Sí, enviamos a...' }],
  })
  @Column({ type: 'jsonb', name: 'faq', nullable: true })
  faq: FaqItem[] | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date | null;
}
