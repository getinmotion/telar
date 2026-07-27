import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductIdentity } from '../../product-identity/entities/product-identity.entity';
import { UsersPassport } from '../../users-passport/entities/users-passport.entity';

@Entity({ name: 'passport_user', schema: 'digital_identity' })
@Index(['passportIdentityId', 'userPassportId'], { unique: true })
export class PassportUser extends BaseEntity {
  @ApiProperty({
    description: 'ID único de la relación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID de la identidad del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'passport_identity_id' })
  passportIdentityId: string;

  @ApiProperty({
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_passport_id' })
  userPassportId: string;

  @ApiProperty({
    description: 'Indica si la relación está activa',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-01-26T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2026-01-26T10:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  @ApiPropertyOptional({
    description: 'Identidad del producto relacionada',
    type: () => ProductIdentity,
  })
  @ManyToOne(
    () => ProductIdentity,
    (productIdentity) => productIdentity.passportUsers,
    { eager: false },
  )
  @JoinColumn({ name: 'passport_identity_id' })
  productIdentity?: ProductIdentity;

  @ApiPropertyOptional({
    description: 'Usuario comprador relacionado',
    type: () => UsersPassport,
  })
  @ManyToOne(
    () => UsersPassport,
    (usersPassport) => usersPassport.passportUsers,
    { eager: false },
  )
  @JoinColumn({ name: 'user_passport_id' })
  userPassport?: UsersPassport;
}
