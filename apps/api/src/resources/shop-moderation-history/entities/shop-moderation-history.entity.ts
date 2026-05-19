import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'shop_moderation_history', schema: 'shop' })
export class ShopModerationHistory extends BaseEntity {
  @ApiProperty({ description: 'ID único del historial de moderación de tienda' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID de la tienda' })
  @Column({ type: 'uuid', name: 'shop_id' })
  shopId!: string;

  @ApiPropertyOptional({
    description: 'Estado anterior de la tienda',
    nullable: true,
  })
  @Column({ type: 'text', name: 'previous_status', nullable: true })
  previousStatus?: string | null;

  @ApiProperty({ description: 'Nuevo estado de la tienda' })
  @Column({ type: 'text', name: 'new_status' })
  newStatus!: string;

  @ApiProperty({
    description: 'Tipo de acción realizada',
    example: 'marketplace_approval',
  })
  @Column({ type: 'text', name: 'action_type' })
  actionType!: string;

  @ApiPropertyOptional({
    description: 'ID del moderador que realizó el cambio',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'moderator_id', nullable: true })
  moderatorId?: string | null;

  @ApiPropertyOptional({
    description: 'Comentario del moderador',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({
    description: 'Ediciones realizadas en formato JSON',
  })
  @Column({ type: 'jsonb', name: 'edits_made', default: {} })
  editsMade!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;
}
