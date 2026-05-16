import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'users', schema: 'auth' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'encrypted_password',
  })
  encryptedPassword: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'email_confirmed_at',
  })
  emailConfirmedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'recovery_token',
  })
  recoveryToken!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'recovery_sent_at',
  })
  recoverySentAt!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_sign_in_at',
  })
  lastSignInAt: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'created_at',
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date | null;

  @Column({ type: 'text', nullable: true, default: null })
  phone: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'phone_confirmed_at',
  })
  phoneConfirmedAt: Date | null;

  @Column({ type: 'text', nullable: true, default: '', name: 'phone_change' })
  phoneChange: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: '',
    name: 'phone_change_token',
  })
  phoneChangeToken: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'phone_change_sent_at',
  })
  phoneChangeSentAt: Date | null;

  // Columna generada - TypeORM no soporta GENERATED ALWAYS directamente,
  // por lo que esta columna será manejada por la base de datos
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'confirmed_at',
    insert: false,
    update: false,
  })
  confirmedAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'banned_until',
  })
  bannedUntil: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

}
