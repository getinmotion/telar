import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@Injectable()
export class CountriesService {
  constructor(
    @Inject('COUNTRIES_REPOSITORY')
    private readonly countriesRepository: Repository<Country>,
  ) {}

  /**
   * Crear un nuevo país
   */
  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    const newCountry = this.countriesRepository.create(createCountryDto);
    return await this.countriesRepository.save(newCountry);
  }

  /**
   * Obtener todos los países
   */
  async findAll(): Promise<Country[]> {
    return await this.countriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un país por ID
   */
  async findOne(id: string): Promise<Country> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const country = await this.countriesRepository.findOne({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }

    return country;
  }

  /**
   * Actualizar un país
   */
  async update(
    id: string,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    // Verificar que el país existe
    await this.findOne(id);

    // Actualizar
    await this.countriesRepository.update(id, updateCountryDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un país
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el país existe
    await this.findOne(id);

    // Eliminar
    await this.countriesRepository.delete(id);

    return {
      message: `País con ID ${id} eliminado exitosamente`,
    };
  }
}
