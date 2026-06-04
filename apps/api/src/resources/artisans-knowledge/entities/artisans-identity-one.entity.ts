import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity({ schema: 'artisans_knowledge', name: 'artisans_identity_one' })
export class ArtisansIdentityOne {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name_shop', type: 'text' })
  nameShop!: string;

  @Column({ name: 'artisan_history', type: 'text' })
  artisanHistory!: string;

  @Column({ name: 'age_experience', type: 'smallint' })
  ageExperience!: number;

  @Column({ name: 'shop_history', type: 'text' })
  shopHistory!: string;

  @Column({ name: 'shop_description', type: 'text' })
  shopDescription!: string;

  @Column({ name: 'shop_definition', type: 'text' })
  shopDefinition!: string;

  @Column({ name: 'shop_categories_id', type: 'uuid' })
  shopCategoriesId!: string;

  @Column({ name: 'shop_special_definition_one', type: 'text' })
  shopSpecialDefinitionOne!: string;

  @Column({ name: 'shop_special_definition_two', type: 'text', nullable: true })
  shopSpecialDefinitionTwo?: string;

  @Column({ name: 'shop_special_definition_three', type: 'text', nullable: true })
  shopSpecialDefinitionThree?: string;

  @Column({ name: 'shop_born_special_definition_one', type: 'text' })
  shopBornSpecialDefinitionOne!: string;

  @Column({ name: 'shop_born_special_definition_two', type: 'text', nullable: true })
  shopBornSpecialDefinitionTwo?: string;

  @Column({ name: 'shop_born_special_definition_three', type: 'text', nullable: true })
  shopBornSpecialDefinitionThree?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'shop_categories_id' })
  category?: Category;
}
