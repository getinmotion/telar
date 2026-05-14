import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdTypeUser } from './entities/id-type-user.entity';

@Injectable()
export class IdTypeUserService {
  constructor(
    @Inject('ID_TYPE_USER_REPOSITORY')
    private readonly idTypeUserRepository: Repository<IdTypeUser>,
  ) {}

  /**
   * Obtener todos los tipos de identificación
   */
  async findAll(): Promise<IdTypeUser[]> {
    return await this.idTypeUserRepository.find({
      order: { typeName: 'ASC' },
    });
  }

  /**
   * Obtener un tipo de identificación por ID
   */
  async findOne(id: string): Promise<IdTypeUser> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const idType = await this.idTypeUserRepository.findOne({
      where: { id },
    });

    if (!idType) {
      throw new NotFoundException(
        `Tipo de identificación con ID ${id} no encontrado`,
      );
    }

    return idType;
  }

  /**
   * Obtener un tipo de identificación por su valor (código)
   */
  async findByValue(idTypeValue: string): Promise<IdTypeUser> {
    if (!idTypeValue) {
      throw new BadRequestException('El valor del tipo de ID es requerido');
    }

    const idType = await this.idTypeUserRepository.findOne({
      where: { idTypeValue },
    });

    if (!idType) {
      throw new NotFoundException(
        `Tipo de identificación con valor ${idTypeValue} no encontrado`,
      );
    }

    return idType;
  }

  /**
   * Obtener tipos de identificación por país
   */
  async findByCountry(countryId: string): Promise<IdTypeUser[]> {
    if (!countryId) {
      throw new BadRequestException('El ID del país es requerido');
    }

    return await this.idTypeUserRepository.find({
      where: { countriesId: countryId },
      order: { typeName: 'ASC' },
    });
  }

  /**
   * Crear un nuevo tipo de identificación
   */
  async create(createData: {
    idTypeValue: string;
    typeName: string;
    countriesId: string;
  }): Promise<IdTypeUser> {
    // Verificar si ya existe un tipo con ese valor
    const existingIdType = await this.idTypeUserRepository.findOne({
      where: { idTypeValue: createData.idTypeValue },
    });

    if (existingIdType) {
      throw new ConflictException(
        `Ya existe un tipo de identificación con el valor ${createData.idTypeValue}`,
      );
    }

    const newIdType = this.idTypeUserRepository.create(createData);
    return await this.idTypeUserRepository.save(newIdType);
  }

  /**
   * Actualizar un tipo de identificación
   */
  async update(
    id: string,
    updateData: Partial<{
      idTypeValue: string;
      typeName: string;
      countriesId: string;
    }>,
  ): Promise<IdTypeUser> {
    // Verificar que el tipo existe
    await this.findOne(id);

    // Si se está actualizando el valor, verificar que no exista otro con ese valor
    if (updateData.idTypeValue) {
      const existingIdType = await this.idTypeUserRepository.findOne({
        where: { idTypeValue: updateData.idTypeValue },
      });

      if (existingIdType && existingIdType.id !== id) {
        throw new ConflictException(
          `Ya existe un tipo de identificación con el valor ${updateData.idTypeValue}`,
        );
      }
    }

    // Actualizar
    await this.idTypeUserRepository.update(id, updateData);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un tipo de identificación
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el tipo existe
    await this.findOne(id);

    // Eliminar
    await this.idTypeUserRepository.delete(id);

    return {
      message: `Tipo de identificación con ID ${id} eliminado exitosamente`,
    };
  }
}
