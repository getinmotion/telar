import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IdTypeUser } from '../../id-type-user/entities/id-type-user.entity';
import { Agreement } from '../../agreements/entities/agreement.entity';

@Entity({ schema: 'auth', name: 'users_id_agreement' })
export class UsersIdAgreement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_type', type: 'uuid' })
  idType!: string;

  @Column({ name: 'num_id', type: 'text' })
  numId!: string;

  @Column({ name: 'agreement_id', type: 'uuid' })
  agreementId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @ManyToOne(() => IdTypeUser)
  @JoinColumn({ name: 'id_type' })
  idTypeUser?: IdTypeUser;

  @ManyToOne(() => Agreement)
  @JoinColumn({ name: 'agreement_id' })
  agreement?: Agreement;
}
