import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AppRole } from '../enums/app-role.enum';

/**
 * Entidad que representa los roles asignados a los usuarios
 * Schema: auth
 */
@Entity('user_roles', { schema: 'auth' })
@Index('idx_user_roles_user_id', ['userId'])
@Index('idx_user_roles_role', ['role'])
@Index('user_roles_user_id_role_key', ['userId', 'role'], { unique: true })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AppRole,
    enumName: 'app_role',
  })
  role: AppRole;

  @Column({
    name: 'granted_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  grantedAt: Date;

  @Column({ name: 'granted_by', type: 'uuid', nullable: true })
  grantedBy: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'granted_by' })
  grantedByUser: User | null;
}
