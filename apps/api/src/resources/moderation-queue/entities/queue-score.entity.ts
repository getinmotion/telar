import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type QueueItemType =
  | 'product'
  | 'shop'
  | 'taxonomy_material'
  | 'taxonomy_craft'
  | 'taxonomy_technique'
  | 'taxonomy_style';

@Entity({ name: 'queue_scores', schema: 'shop' })
export class QueueScore extends BaseEntity {
  @ApiProperty({ description: 'ID del item (producto, tienda o taxonomía)' })
  @PrimaryColumn({ type: 'uuid', name: 'item_id' })
  itemId!: string;

  @ApiProperty({ description: 'Tipo de item en la cola' })
  @PrimaryColumn({ type: 'text', name: 'item_type' })
  itemType!: QueueItemType;

  @ApiProperty({ description: 'Score de prioridad (0-100)', default: 0 })
  @Column({ type: 'int', name: 'priority_score', default: 0 })
  priorityScore!: number;

  @ApiProperty({ description: 'Score de riesgo (0-100)', default: 0 })
  @Column({ type: 'int', name: 'risk_score', default: 0 })
  riskScore!: number;

  @ApiProperty({ description: 'Score comercial (0-100)', default: 0 })
  @Column({ type: 'int', name: 'commercial_score', default: 0 })
  commercialScore!: number;

  @ApiProperty({ description: 'Razones que afectaron los scores' })
  @Column({ type: 'jsonb', name: 'score_reasons', default: {} })
  scoreReasons!: Record<string, any>;

  @ApiProperty({ description: 'Última vez que se computaron los scores' })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'computed_at',
  })
  computedAt!: Date;
}
