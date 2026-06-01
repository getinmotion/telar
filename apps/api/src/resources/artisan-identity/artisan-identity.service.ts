import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanIdentity } from './entities/artisan-identity.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { CreateArtisanIdentityDto } from './dto/create-artisan-identity.dto';
import { UpdateArtisanIdentityDto } from './dto/update-artisan-identity.dto';

@Injectable()
export class ArtisanIdentityService {
  constructor(
    @Inject('ARTISAN_IDENTITY_REPOSITORY')
    private readonly artisanIdentityRepository: Repository<ArtisanIdentity>,
    @Inject('USER_PROFILES_REPOSITORY_FOR_IDENTITY')
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Crear un nuevo registro de identidad artesanal
   */
  async create(
    createDto: CreateArtisanIdentityDto,
  ): Promise<ArtisanIdentity> {
    const newIdentity = this.artisanIdentityRepository.create(createDto);
    return await this.artisanIdentityRepository.save(newIdentity);
  }

  /**
   * Obtener todos los registros de identidad artesanal
   */
  async findAll(): Promise<ArtisanIdentity[]> {
    return await this.artisanIdentityRepository.find({
      relations: ['techniquePrimary', 'techniqueSecondary'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un registro de identidad artesanal por ID
   */
  async findOne(id: string): Promise<ArtisanIdentity> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const identity = await this.artisanIdentityRepository.findOne({
      where: { id },
      relations: ['techniquePrimary', 'techniqueSecondary'],
    });

    if (!identity) {
      throw new NotFoundException(
        `Registro de identidad con ID ${id} no encontrado`,
      );
    }

    return identity;
  }

  /**
   * Actualizar un registro de identidad artesanal
   */
  async update(
    id: string,
    updateDto: UpdateArtisanIdentityDto,
  ): Promise<ArtisanIdentity> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Actualizar
    await this.artisanIdentityRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Obtener artisan identity por userId (a través de UserProfile).
   * Retorna null si el usuario no tiene perfil o no tiene identity asignada.
   */
  async findByUserId(userId: string): Promise<ArtisanIdentity | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      select: ['artisanIdentityId'],
    });
    if (!profile?.artisanIdentityId) return null;
    return this.artisanIdentityRepository.findOne({
      where: { id: profile.artisanIdentityId },
      relations: ['techniquePrimary', 'techniqueSecondary'],
    });
  }

  /**
   * Actualiza las técnicas (primary / secondary) del artisan identity de un usuario.
   * Si el usuario no tiene identity aún, no hace nada (retorna null).
   */
  async updateTechniquesByUserId(
    userId: string,
    dto: { techniquePrimaryId?: string | null; techniqueSecondaryId?: string | null },
  ): Promise<ArtisanIdentity | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      select: ['artisanIdentityId'],
    });
    if (!profile?.artisanIdentityId) return null;
    await this.artisanIdentityRepository.update(profile.artisanIdentityId, dto);
    return this.findOne(profile.artisanIdentityId);
  }

  /**
   * Eliminar un registro de identidad artesanal
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Eliminar
    await this.artisanIdentityRepository.delete(id);

    return {
      message: `Registro de identidad con ID ${id} eliminado exitosamente`,
    };
  }
}
