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
import { Territory } from 'src/resources/territories/entities/territory.entity';

@Entity({ name: 'artisan_territorial', schema: 'artesanos' })
export class ArtisanTerritorial extends BaseEntity {
  @ApiProperty({ description: 'ID único del registro territorial' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del territorio',
    type: String,
  })
  @Column({ type: 'uuid', nullable: false, name: 'territorial_id' })
  territorialId: string;

  @ApiProperty({ description: 'Relación con el territorio' })
  @ManyToOne(() => Territory, { nullable: false })
  @JoinColumn({ name: 'territorial_id' })
  territory: Territory;

  @ApiPropertyOptional({
    description: 'Importancia territorial',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'territorial_importance' })
  territorialImportance: string | null;

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
