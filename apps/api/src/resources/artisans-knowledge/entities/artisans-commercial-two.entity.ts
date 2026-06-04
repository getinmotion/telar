import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'artisans_knowledge', name: 'artisans_commercial_two' })
export class ArtisansCommercialTwo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_range_payment', type: 'text' })
  shopRangePayment!: string;

  @Column({ name: 'shop_knowledge_cost', type: 'text' })
  shopKnowledgeCost!: string;

  @Column({ name: 'shop_knowledge_define_cost', type: 'text' })
  shopKnowledgeDefineCost!: string;

  @Column({ name: 'shop_knowledge_is_profitable', type: 'text' })
  shopKnowledgeIsProfitable!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
