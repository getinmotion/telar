import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PassportUser } from './entities/passport-user.entity';
import { CreatePassportUserDto } from './dto/create-passport-user.dto';
import { UpdatePassportUserDto } from './dto/update-passport-user.dto';

@Injectable()
export class PassportUserService {
  constructor(
    @Inject('PASSPORT_USER_REPOSITORY')
    private readonly passportUserRepository: Repository<PassportUser>,
  ) {}

  /**
   * Crear una nueva relación entre identidad de producto y usuario comprador
   */
  async create(createDto: CreatePassportUserDto): Promise<PassportUser> {
    // Validar que no exista la relación
    const existing = await this.passportUserRepository.findOne({
      where: {
        passportIdentityId: createDto.passportIdentityId,
        userPassportId: createDto.userPassportId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'La relación entre esta identidad de producto y usuario comprador ya existe',
      );
    }

    const newRelation = this.passportUserRepository.create(createDto);
    return await this.passportUserRepository.save(newRelation);
  }

  /**
   * Obtener todas las relaciones
   */
  async getAll(): Promise<PassportUser[]> {
    return await this.passportUserRepository.find({
      relations: ['productIdentity', 'userPassport'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una relación por ID
   */
  async getById(id: string): Promise<PassportUser> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const relation = await this.passportUserRepository.findOne({
      where: { id },
      relations: ['productIdentity', 'userPassport'],
    });

    if (!relation) {
      throw new NotFoundException(`Relación con ID ${id} no encontrada`);
    }

    return relation;
  }

  /**
   * Obtener relaciones por ID de identidad de producto
   */
  async getByProductIdentityId(
    passportIdentityId: string,
  ): Promise<PassportUser[]> {
    if (!passportIdentityId) {
      throw new BadRequestException(
        'El ID de la identidad del producto es requerido',
      );
    }

    return await this.passportUserRepository.find({
      where: { passportIdentityId },
      relations: ['productIdentity', 'userPassport'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener relaciones por ID de usuario comprador
   */
  async getByUserPassportId(userPassportId: string): Promise<PassportUser[]> {
    if (!userPassportId) {
      throw new BadRequestException(
        'El ID del usuario comprador es requerido',
      );
    }

    return await this.passportUserRepository.find({
      where: { userPassportId },
      relations: ['productIdentity', 'userPassport'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Verificar si existe una relación activa entre identidad de producto y usuario
   */
  async existsActiveRelation(
    passportIdentityId: string,
    userPassportId: string,
  ): Promise<boolean> {
    const relation = await this.passportUserRepository.findOne({
      where: {
        passportIdentityId,
        userPassportId,
        isActive: true,
      },
    });

    return !!relation;
  }

  /**
   * Actualizar una relación
   */
  async update(
    id: string,
    updateDto: UpdatePassportUserDto,
  ): Promise<PassportUser> {
    // Verificar que existe
    await this.getById(id);

    // Si se están actualizando las claves, validar que no exista la nueva combinación
    if (updateDto.passportIdentityId || updateDto.userPassportId) {
      const current = await this.getById(id);
      const newPassportIdentityId =
        updateDto.passportIdentityId || current.passportIdentityId;
      const newUserPassportId =
        updateDto.userPassportId || current.userPassportId;

      // Verificar si la nueva combinación ya existe (excepto el registro actual)
      const existing = await this.passportUserRepository
        .createQueryBuilder('pu')
        .where('pu.passport_identity_id = :passportIdentityId', {
          passportIdentityId: newPassportIdentityId,
        })
        .andWhere('pu.user_passport_id = :userPassportId', {
          userPassportId: newUserPassportId,
        })
        .andWhere('pu.id != :id', { id })
        .getOne();

      if (existing) {
        throw new ConflictException(
          'Ya existe una relación con esta combinación de identidad de producto y usuario comprador',
        );
      }
    }

    // Actualizar
    await this.passportUserRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar una relación (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.passportUserRepository.softDelete(id);

    return {
      message: `Relación con ID ${id} eliminada exitosamente`,
    };
  }
}
