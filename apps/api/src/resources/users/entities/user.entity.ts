import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

@Entity({ name: 'users', schema: 'auth' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'instance_id' })
  instanceId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  aud: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'encrypted_password' })
  encryptedPassword: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'email_confirmed_at' })
  emailConfirmedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'invited_at' })
  invitedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'confirmation_token' })
  confirmationToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'confirmation_sent_at' })
  confirmationSentAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'recovery_token' })
  recoveryToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'recovery_sent_at' })
  recoverySentAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_change_token_new' })
  emailChangeTokenNew: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_change' })
  emailChange: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'email_change_sent_at' })
  emailChangeSentAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_sign_in_at' })
  lastSignInAt: Date | null;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_app_meta_data' })
  rawAppMetaData: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_user_meta_data' })
  rawUserMetaData: Record<string, any> | null;

  @Column({ type: 'boolean', nullable: true, name: 'is_super_admin' })
  isSuperAdmin: boolean | null;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true, name: 'created_at' })
  createdAt: Date | null;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true, name: 'updated_at' })
  updatedAt: Date | null;

  @Column({ type: 'text', nullable: true, default: null })
  phone: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'phone_confirmed_at' })
  phoneConfirmedAt: Date | null;

  @Column({ type: 'text', nullable: true, default: '', name: 'phone_change' })
  phoneChange: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '', name: 'phone_change_token' })
  phoneChangeToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'phone_change_sent_at' })
  phoneChangeSentAt: Date | null;

  // Columna generada - TypeORM no soporta GENERATED ALWAYS directamente,
  // por lo que esta columna será manejada por la base de datos
  @Column({ type: 'timestamp with time zone', nullable: true, name: 'confirmed_at', insert: false, update: false })
  confirmedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '', name: 'email_change_token_current' })
  emailChangeTokenCurrent: string | null;

  @Column({ type: 'smallint', nullable: true, default: 0, name: 'email_change_confirm_status' })
  emailChangeConfirmStatus: number | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'banned_until' })
  bannedUntil: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '', name: 'reauthentication_token' })
  reauthenticationToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'reauthentication_sent_at' })
  reauthenticationSentAt: Date | null;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_sso_user' })
  isSsoUser: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_anonymous' })
  isAnonymous: boolean;
}