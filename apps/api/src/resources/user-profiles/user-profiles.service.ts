import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfilesService {
  constructor(
    @Inject('USER_PROFILES_REPOSITORY')
    private readonly userProfilesRepository: Repository<UserProfile>,
  ) {}

  /**
   * Crear un nuevo perfil de usuario
   */
  async create(createDto: CreateUserProfileDto): Promise<UserProfile> {
    // Verificar si ya existe un perfil para este usuario
    const existingProfile = await this.userProfilesRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Ya existe un perfil para este usuario',
      );
    }

    const newProfile = this.userProfilesRepository.create(createDto);
    return await this.userProfilesRepository.save(newProfile);
  }

  /**
   * Obtener todos los perfiles de usuario
   */
  async getAll(): Promise<UserProfile[]> {
    return await this.userProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un perfil de usuario por ID
   */
  async getById(id: string): Promise<UserProfile> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const profile = await this.userProfilesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return profile;
  }

  /**
   * Obtener perfil de usuario por userId
   */
  async getByUserId(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.userProfilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Actualizar un perfil de usuario
   */
  async update(
    id: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    // Verificar que el perfil existe
    await this.getById(id);

    // Actualizar
    await this.userProfilesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un perfil de usuario
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que el perfil existe
    await this.getById(id);

    // Eliminar (hard delete porque no tiene columna deletedAt)
    await this.userProfilesRepository.delete(id);

    return {
      message: `Perfil con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Buscar perfiles por tipo de cuenta
   */
  async findByAccountType(accountType: string): Promise<UserProfile[]> {
    return await this.userProfilesRepository.find({
      where: { accountType: accountType as any },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar perfiles por departamento
   */
  async findByDepartment(department: string): Promise<UserProfile[]> {
    return await this.userProfilesRepository.find({
      where: { department },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar perfiles con RUT pendiente
   */
  async findWithPendingRut(): Promise<UserProfile[]> {
    return await this.userProfilesRepository.find({
      where: { rutPendiente: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

