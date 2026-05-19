import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'store_health_scores', schema: 'shop' })
export class StoreHealthScore extends BaseEntity {
  @ApiProperty({ description: 'ID de la tienda (PK y FK)' })
  @PrimaryColumn({ type: 'uuid', name: 'store_id' })
  storeId!: string;

  @ApiProperty({ description: 'Score total (0-100)' })
  @Column({ type: 'int', name: 'score_total', default: 0 })
  scoreTotal!: number;

  @ApiProperty({ description: 'Score de branding: logo, portada, identidad visual (0-25)' })
  @Column({ type: 'int', name: 'score_branding', default: 0 })
  scoreBranding!: number;

  @ApiProperty({ description: 'Score de catálogo: productos, fotos, variantes (0-25)' })
  @Column({ type: 'int', name: 'score_catalog', default: 0 })
  scoreCatalog!: number;

  @ApiProperty({ description: 'Score de narrativa: historia, descripción, misión (0-25)' })
  @Column({ type: 'int', name: 'score_narrative', default: 0 })
  scoreNarrative!: number;

  @ApiProperty({ description: 'Score de consistencia: taxonomía, datos completos (0-25)' })
  @Column({ type: 'int', name: 'score_consistency', default: 0 })
  scoreConsistency!: number;

  @ApiProperty({ description: 'Última vez que se calculó el score' })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'last_computed_at',
  })
  lastComputedAt!: Date;
}
