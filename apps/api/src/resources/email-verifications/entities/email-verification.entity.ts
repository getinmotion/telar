import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/resources/users/entities/user.entity';

@Entity({ name: 'email_verifications', schema: 'public' })
@Check(`"expires_at" > "created_at"`)
export class EmailVerification extends BaseEntity {
  @ApiProperty({ description: 'ID único de la verificación de email' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario (relación 1 a 1 con auth.users)',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Relación con el usuario' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Token de verificación único',
  })
  @Column({ type: 'text', unique: true })
  token: string;

  @ApiProperty({
    description: 'Fecha de expiración del token',
  })
  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha en que se usó el token (null si no se ha usado)',
  })
  @Column({ type: 'timestamp with time zone', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;
}
