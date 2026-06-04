import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'artisans_knowledge', name: 'artisans_client_market_three' })
export class ArtisansClientMarketThree {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_knowledge_main_buyer_one', type: 'text' })
  shopKnowledgeMainBuyerOne!: string;

  @Column({ name: 'shop_knowledge_main_buyer_two', type: 'text', nullable: true })
  shopKnowledgeMainBuyerTwo?: string;

  @Column({ name: 'shop_knowledge_main_buyer_three', type: 'text', nullable: true })
  shopKnowledgeMainBuyerThree?: string;

  @Column({ name: 'shop_knowledge_digital_presence', type: 'text' })
  shopKnowledgeDigitalPresence!: string;

  @Column({ name: 'shop_knowledge_where_sale_one', type: 'text' })
  shopKnowledgeWhereSaleOne!: string;

  @Column({ name: 'shop_knowledge_where_sale_two', type: 'text', nullable: true })
  shopKnowledgeWhereSaleTwo?: string;

  @Column({ name: 'shop_knowledge_where_sale_three', type: 'text', nullable: true })
  shopKnowledgeWhereSaleThree?: string;

  @Column({ name: 'shop_knowledge_sales_activity', type: 'text' })
  shopKnowledgeSalesActivity!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
