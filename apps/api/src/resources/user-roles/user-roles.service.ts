import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';
import { AppRole } from './enums/app-role.enum';

@Injectable()
export class UserRolesService {
  constructor(
    @Inject('USER_ROLES_REPOSITORY')
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Asignar un rol a un usuario
   */
  async create(createUserRoleDto: CreateUserRoleDto): Promise<UserRole> {
    // Verificar si el usuario ya tiene ese rol
    const existingRole = await this.userRoleRepository.findOne({
      where: {
        userId: createUserRoleDto.userId,
        role: createUserRoleDto.role,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        `El usuario ya tiene el rol ${createUserRoleDto.role}`,
      );
    }

    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  /**
   * Obtener todos los roles de usuarios (con paginación opcional)
   */
  async findAll(options?: {
    userId?: string;
    role?: AppRole;
    limit?: number;
    offset?: number;
  }): Promise<{ data: UserRole[]; total: number }> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.user', 'user')
      .leftJoinAndSelect('userRole.grantedByUser', 'grantedByUser');

    if (options?.userId) {
      queryBuilder.andWhere('userRole.userId = :userId', {
        userId: options.userId,
      });
    }

    if (options?.role) {
      queryBuilder.andWhere('userRole.role = :role', { role: options.role });
    }

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }

    if (options?.offset) {
      queryBuilder.skip(options.offset);
    }

    const [data, total] = await queryBuilder
      .orderBy('userRole.grantedAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Obtener un rol de usuario por ID
   */
  async findOne(id: string): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
      relations: ['user', 'grantedByUser'],
    });

    if (!userRole) {
      throw new NotFoundException(`Rol de usuario con ID ${id} no encontrado`);
    }

    return userRole;
  }

  /**
   * Obtener todos los roles de un usuario específico
   */
  async findByUserId(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId },
      relations: ['grantedByUser'],
      order: { grantedAt: 'DESC' },
    });
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const count = await this.userRoleRepository.count({
      where: { userId, role },
    });
    return count > 0;
  }

  /**
   * Verificar si un usuario tiene alguno de los roles especificados
   */
  async hasAnyRole(userId: string, roles: AppRole[]): Promise<boolean> {
    const count = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .where('userRole.userId = :userId', { userId })
      .andWhere('userRole.role IN (:...roles)', { roles })
      .getCount();

    return count > 0;
  }

  /**
   * Actualizar un rol de usuario (generalmente no se usa, los roles se crean/eliminan)
   */
  async update(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserRole> {
    const userRole = await this.findOne(id);

    // Si se intenta cambiar el rol o el usuario, verificar que no exista ya
    if (
      updateUserRoleDto.role &&
      updateUserRoleDto.role !== userRole.role
    ) {
      const existingRole = await this.userRoleRepository.findOne({
        where: {
          userId: userRole.userId,
          role: updateUserRoleDto.role,
        },
      });

      if (existingRole) {
        throw new ConflictException(
          `El usuario ya tiene el rol ${updateUserRoleDto.role}`,
        );
      }
    }

    Object.assign(userRole, updateUserRoleDto);
    return this.userRoleRepository.save(userRole);
  }

  /**
   * Remover un rol de un usuario
   */
  async remove(id: string): Promise<void> {
    const userRole = await this.findOne(id);
    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Remover un rol específico de un usuario
   */
  async removeUserRole(userId: string, role: AppRole): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, role },
    });

    if (!userRole) {
      throw new NotFoundException(
        `El usuario no tiene el rol ${role} asignado`,
      );
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Remover todos los roles de un usuario
   */
  async removeAllUserRoles(userId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }
}
