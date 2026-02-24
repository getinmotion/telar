import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.getByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el teléfono ya existe (si se proporciona)
    if (createUserDto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: createUserDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const newUser = this.userRepository.create({
      ...createUserDto,
      encryptedPassword: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  /**
   * Obtener todos los usuarios
   */
  async getAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un usuario por ID
   */
  async getById(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Obtener un usuario por email
   */
  async getByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    const user = await this.getById(id);

    // Si se actualiza el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.getByEmail(updateUserDto.email);
      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Si se actualiza el teléfono, verificar que no esté en uso
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto['encryptedPassword'] = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
      delete updateUserDto.password;
    }

    // Actualizar el usuario
    await this.userRepository.update(id, updateUserDto);

    // Retornar el usuario actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que el usuario existe
    const user = await this.getById(id);

    // Soft delete: marcar como eliminado
    await this.userRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      message: `Usuario con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Eliminar permanentemente un usuario (hard delete)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    // Verificar que el usuario existe
    const user = await this.getById(id);

    // Eliminar permanentemente
    await this.userRepository.delete(id);

    return {
      message: `Usuario con ID ${id} eliminado permanentemente`,
    };
  }

  /**
   * Restaurar un usuario eliminado
   */
  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!user.deletedAt) {
      throw new BadRequestException('El usuario no está eliminado');
    }

    await this.userRepository.update(id, {
      deletedAt: null,
    });

    return await this.getById(id);
  }

  /**
   * Verificar contraseña (útil para login y autenticación)
   * Compatible con hashes de Supabase
   */
  async verifyPassword(
    plainPassword: string,
    encryptedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, encryptedPassword);
  }

  /**
   * Validar credenciales de usuario (para login)
   * Compatible con usuarios migrados de Supabase
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getByEmail(email);

    if (!user || !user.encryptedPassword) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(
      password,
      user.encryptedPassword,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
