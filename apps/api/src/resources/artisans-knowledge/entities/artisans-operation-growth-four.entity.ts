import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'artisans_knowledge', name: 'artisans_operation_growth_four' })
export class ArtisansOperationGrowthFour {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_knowledge_products_make_month', type: 'text' })
  shopKnowledgeProductsMakeMonth!: string;

  @Column({ name: 'shop_knowledge_limit_today_one', type: 'text' })
  shopKnowledgeLimitTodayOne!: string;

  @Column({ name: 'shop_knowledge_limit_today_two', type: 'text', nullable: true })
  shopKnowledgeLimitTodayTwo?: string;

  @Column({ name: 'shop_knowledge_limit_today_three', type: 'text', nullable: true })
  shopKnowledgeLimitTodayThree?: string;

  @Column({ name: 'shop_many_workers', type: 'text' })
  shopManyWorkers!: string;

  @Column({ name: 'shop_first_solving_telar', type: 'text' })
  shopFirstSolvingTelar!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
