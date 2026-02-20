import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

@Injectable()
export class AddressesService {
  constructor(
    @Inject('ADDRESSES_REPOSITORY')
    private readonly addressesRepository: Repository<Address>,
    @Inject('USER_PROFILES_REPOSITORY')
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Crear una nueva dirección
   */
  async create(createDto: CreateAddressDto): Promise<Address> {
    // Verificar que el usuario existe
    const userExists = await this.userProfileRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.userId} no encontrado`,
      );
    }

    // Si se marca como default, desmarcar las demás direcciones del usuario
    if (createDto.isDefault) {
      await this.addressesRepository.update(
        { userId: createDto.userId, isDefault: true },
        { isDefault: false },
      );
    }

    const newAddress = this.addressesRepository.create(createDto);
    return await this.addressesRepository.save(newAddress);
  }

  /**
   * Obtener todas las direcciones
   */
  async findAll(): Promise<Address[]> {
    return await this.addressesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una dirección por ID
   */
  async findOne(id: string): Promise<Address> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const address = await this.addressesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    return address;
  }

  /**
   * Obtener direcciones por userId
   */
  async findByUserId(userId: string): Promise<Address[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una dirección
   */
  async update(id: string, updateDto: UpdateAddressDto): Promise<Address> {
    // Verificar que existe
    const address = await this.findOne(id);

    // Si se marca como default, desmarcar las demás direcciones del usuario
    if (updateDto.isDefault) {
      await this.addressesRepository.update(
        { userId: address.userId, isDefault: true },
        { isDefault: false },
      );
    }

    // Actualizar
    await this.addressesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una dirección
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.addressesRepository.delete(id);

    return {
      message: `Dirección con ID ${id} eliminada exitosamente`,
    };
  }

  /**
   * Establecer una dirección como predeterminada
   */
  async setAsDefault(id: string): Promise<Address> {
    const address = await this.findOne(id);

    // Desmarcar todas las direcciones del usuario
    await this.addressesRepository.update(
      { userId: address.userId, isDefault: true },
      { isDefault: false },
    );

    // Marcar esta como default
    await this.addressesRepository.update(id, { isDefault: true });

    return await this.findOne(id);
  }
}
