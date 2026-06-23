import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'agents', name: 'suggest_products_draft' })
export class SuggestProductsDraft {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'suggest_agent_step_1_2', type: 'jsonb', default: {} })
  suggestAgentStep12!: Record<string, any>;

  @Column({ name: 'suggest_agent_step_3_4', type: 'jsonb', default: {} })
  suggestAgentStep34!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
