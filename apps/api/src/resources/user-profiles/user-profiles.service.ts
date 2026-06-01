import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfilesService {
  private readonly algorithm = 'aes-256-cbc';

  constructor(
    @Inject('USER_PROFILES_REPOSITORY')
    private readonly userProfilesRepository: Repository<UserProfile>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Encripta un texto usando AES-256-CBC
   */
  private encrypt(text: string): string {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY no está configurada en las variables de entorno');
    }

    // La key debe ser de 32 bytes para AES-256
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornar IV + encrypted data (separados por :)
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta un texto encriptado con AES-256-CBC
   */
  private decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return encryptedText;
    }

    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY no está configurada en las variables de entorno');
    }

    try {
      // Separar IV y datos encriptados
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        // Si no tiene el formato esperado, retornar tal cual (puede ser dato sin encriptar)
        return encryptedText;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      // La key debe ser de 32 bytes para AES-256
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // Si falla la desencriptación, retornar el valor original
      console.error('Error desencriptando id_number:', error);
      return encryptedText;
    }
  }

  /**
   * Desencripta el idNumber de un perfil
   */
  private decryptProfile(profile: UserProfile): UserProfile {
    if (profile && profile.idNumber) {
      profile.idNumber = this.decrypt(profile.idNumber);
    }
    return profile;
  }

  /**
   * Desencripta el idNumber de múltiples perfiles
   */
  private decryptProfiles(profiles: UserProfile[]): UserProfile[] {
    return profiles.map(profile => this.decryptProfile(profile));
  }

  /**
   * Crear un nuevo perfil de usuario
   */
  async create(createDto: CreateUserProfileDto): Promise<UserProfile> {
    // Verificar si ya existe un perfil para este usuario
    const existingProfile = await this.userProfilesRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException('Ya existe un perfil para este usuario');
    }

    // Encriptar idNumber si existe
    const dataToSave = { ...createDto };
    if (dataToSave.idNumber) {
      dataToSave.idNumber = this.encrypt(dataToSave.idNumber);
    }

    const newProfile = this.userProfilesRepository.create(dataToSave);
    const savedProfile = await this.userProfilesRepository.save(newProfile);

    // Desencriptar antes de retornar
    return this.decryptProfile(savedProfile);
  }

  /**
   * Obtener todos los perfiles de usuario
   */
  async getAll(): Promise<UserProfile[]> {
    const profiles = await this.userProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.decryptProfiles(profiles);
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

    return this.decryptProfile(profile);
  }

  /**
   * Obtener perfil de usuario por userId
   */
  async getByUserId(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const profile = await this.userProfilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      return null;
    }

    return this.decryptProfile(profile);
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

    // Encriptar idNumber si existe en el DTO
    const dataToUpdate = { ...updateDto };
    if (dataToUpdate.idNumber) {
      dataToUpdate.idNumber = this.encrypt(dataToUpdate.idNumber);
    }

    // Actualizar
    await this.userProfilesRepository.update(id, dataToUpdate);

    // Retornar actualizado (ya desencriptado por getById)
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
    const profiles = await this.userProfilesRepository.find({
      where: { accountType: accountType as any },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.decryptProfiles(profiles);
  }

  /**
   * Buscar perfiles por departamento
   */
  async findByDepartment(department: string): Promise<UserProfile[]> {
    const profiles = await this.userProfilesRepository.find({
      where: { department },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.decryptProfiles(profiles);
  }

  /**
   * Buscar perfiles con RUT pendiente
   */
  async findWithPendingRut(): Promise<UserProfile[]> {
    const profiles = await this.userProfilesRepository.find({
      where: { rutPendiente: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.decryptProfiles(profiles);
  }
}
