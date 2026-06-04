import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ArtisansIdentityOne } from './artisans-identity-one.entity';
import { ArtisansCommercialTwo } from './artisans-commercial-two.entity';
import { ArtisansClientMarketThree } from './artisans-client-market-three.entity';
import { ArtisansOperationGrowthFour } from './artisans-operation-growth-four.entity';

@Entity({ schema: 'artisans_knowledge', name: 'artisans_identity_profile' })
export class ArtisansIdentityProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ name: 'artisans_identity_id', type: 'uuid', nullable: true })
  artisansIdentityId?: string;

  @Column({ name: 'artisans_commercial_id', type: 'uuid', nullable: true })
  artisansCommercialId?: string;

  @Column({ name: 'artisans_client_market_id', type: 'uuid', nullable: true })
  artisansClientMarketId?: string;

  @Column({ name: 'artisans_operation_growth_id', type: 'uuid', nullable: true })
  artisansOperationGrowthId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Relaciones
  @ManyToOne(() => ArtisansIdentityOne, { eager: true })
  @JoinColumn({ name: 'artisans_identity_id' })
  identityOne?: ArtisansIdentityOne;

  @ManyToOne(() => ArtisansCommercialTwo, { eager: true })
  @JoinColumn({ name: 'artisans_commercial_id' })
  commercialTwo?: ArtisansCommercialTwo;

  @ManyToOne(() => ArtisansClientMarketThree, { eager: true })
  @JoinColumn({ name: 'artisans_client_market_id' })
  clientMarketThree?: ArtisansClientMarketThree;

  @ManyToOne(() => ArtisansOperationGrowthFour, { eager: true })
  @JoinColumn({ name: 'artisans_operation_growth_id' })
  operationGrowthFour?: ArtisansOperationGrowthFour;
}
