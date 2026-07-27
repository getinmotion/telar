import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PassportUser } from '../../passport-user/entities/passport-user.entity';

@Entity({ name: 'users_passport', schema: 'digital_identity' })
export class UsersPassport extends BaseEntity {
  @ApiProperty({
    description: 'ID único del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Número de identificación del comprador',
    example: '1234567890',
  })
  @Column({ type: 'varchar', length: 50, name: 'num_identificacion' })
  numIdentificacion: string;

  @ApiProperty({
    description: 'Nombre completo del comprador',
    example: 'Juan Pérez García',
  })
  @Column({ type: 'varchar', length: 255, name: 'nombre_completo' })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Correo electrónico del comprador',
    example: 'juan.perez@example.com',
  })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({
    description: 'Teléfono del comprador',
    example: '+57 300 1234567',
  })
  @Column({ type: 'varchar', length: 50 })
  telefono: string;

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
    description: 'Relaciones con identidades de productos (tabla pivot)',
    type: () => PassportUser,
    isArray: true,
  })
  @OneToMany(() => PassportUser, (passportUser) => passportUser.userPassport)
  passportUsers?: PassportUser[];
}
