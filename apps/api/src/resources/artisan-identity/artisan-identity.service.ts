import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanIdentity } from './entities/artisan-identity.entity';
import { CreateArtisanIdentityDto } from './dto/create-artisan-identity.dto';
import { UpdateArtisanIdentityDto } from './dto/update-artisan-identity.dto';

@Injectable()
export class ArtisanIdentityService {
  constructor(
    @Inject('ARTISAN_IDENTITY_REPOSITORY')
    private readonly artisanIdentityRepository: Repository<ArtisanIdentity>,
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
