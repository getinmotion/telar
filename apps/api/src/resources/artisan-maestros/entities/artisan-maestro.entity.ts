import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile } from 'src/resources/user-profiles/entities/user-profile.entity';

@Entity({ name: 'artisan_maestros', schema: 'artesanos' })
export class ArtisanMaestro extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del perfil artesanal (artisan_profile.id)' })
  @Column({ type: 'uuid', nullable: false, name: 'artisan_id' })
  artisanId: string;

  @ManyToOne(() => UserProfile, { nullable: false })
  @JoinColumn({ name: 'artisan_id' })
  artisan: UserProfile;

  @ApiProperty({ description: 'Nombre del maestro o mentora' })
  @Column({ type: 'text', nullable: false })
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del vínculo de aprendizaje' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;
}
