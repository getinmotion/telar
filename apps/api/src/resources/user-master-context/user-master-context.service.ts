import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserMasterContext } from './entities/user-master-context.entity';
import { CreateUserMasterContextDto } from './dto/create-user-master-context.dto';
import { UpdateUserMasterContextDto } from './dto/update-user-master-context.dto';

@Injectable()
export class UserMasterContextService {
  constructor(
    @Inject('USER_MASTER_CONTEXT_REPOSITORY')
    private readonly userMasterContextRepository: Repository<UserMasterContext>,
  ) {}

  /**
   * Crear un nuevo contexto maestro de usuario
   */
  async create(
    createDto: CreateUserMasterContextDto,
  ): Promise<UserMasterContext> {
    // Verificar si el usuario ya tiene un contexto
    const existing = await this.userMasterContextRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existing) {
      throw new ConflictException(
        'El usuario ya tiene un contexto maestro registrado',
      );
    }

    const newContext = this.userMasterContextRepository.create(createDto);
    return await this.userMasterContextRepository.save(newContext);
  }

  /**
   * Obtener todos los contextos
   */
  async getAll(): Promise<UserMasterContext[]> {
    return await this.userMasterContextRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un contexto por ID
   */
  async getById(id: string): Promise<UserMasterContext> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const context = await this.userMasterContextRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!context) {
      throw new NotFoundException(
        `Contexto maestro con ID ${id} no encontrado`,
      );
    }

    return context;
  }

  /**
   * Obtener contexto por userId (relación 1:1)
   */
  async getByUserId(userId: string): Promise<UserMasterContext | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const context = await this.userMasterContextRepository.findOne({
      where: { userId },
      relations: ['user'],
    });


    return context; // Puede ser null si el usuario no tiene contexto
  }

  /**
   * Obtener contextos por preferencia de idioma
   */
  async getByLanguagePreference(
    language: string,
  ): Promise<UserMasterContext[]> {
    return await this.userMasterContextRepository.find({
      where: { languagePreference: language },
      relations: ['user'],
      order: { lastAssessmentDate: 'DESC' },
    });
  }

  /**
   * Actualizar un contexto
   */
  async update(
    id: string,
    updateDto: UpdateUserMasterContextDto,
  ): Promise<UserMasterContext> {
    // Verificar que existe
    await this.getById(id);

    // Si se actualiza algún campo importante, incrementar versión
    const shouldIncrementVersion =
      updateDto.businessContext ||
      updateDto.goalsAndObjectives ||
      updateDto.businessProfile;

    if (shouldIncrementVersion && !updateDto.contextVersion) {
      const current = await this.getById(id);
      updateDto.contextVersion = (current.contextVersion || 1) + 1;
    }

    // Actualizar
    await this.userMasterContextRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Actualizar contexto por userId
   */
  async updateByUserId(
    userId: string,
    updateDto: UpdateUserMasterContextDto,
  ): Promise<UserMasterContext> {
    const context = await this.getByUserId(userId);

    if (!context) {
      throw new NotFoundException(
        `No se encontró contexto para el usuario ${userId}`,
      );
    }

    return await this.update(context.id, updateDto);
  }

  /**
   * Actualizar fecha de último assessment
   */
  async updateLastAssessmentDate(userId: string): Promise<UserMasterContext> {
    const context = await this.getByUserId(userId);

    if (!context) {
      throw new NotFoundException(
        `No se encontró contexto para el usuario ${userId}`,
      );
    }

    await this.userMasterContextRepository.update(context.id, {
      lastAssessmentDate: new Date(),
    });

    return await this.getById(context.id);
  }

  /**
   * Eliminar un contexto
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar
    await this.userMasterContextRepository.delete(id);

    return {
      message: `Contexto maestro con ID ${id} eliminado exitosamente`,
    };
  }
}
