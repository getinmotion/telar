import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { Agreement } from './entities/agreement.entity';

@Injectable()
export class AgreementsService {
  constructor(
    @Inject('AGREEMENTS_REPOSITORY')
    private readonly agreementsRepository: Repository<Agreement>,
  ) {}

  /**
   * Crear un nuevo acuerdo
   */
  async create(createAgreementDto: CreateAgreementDto): Promise<Agreement> {
    const newAgreement = this.agreementsRepository.create(createAgreementDto);
    return await this.agreementsRepository.save(newAgreement);
  }

  /**
   * Obtener todos los acuerdos
   */
  async findAll(): Promise<Agreement[]> {
    return await this.agreementsRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un acuerdo por ID
   */
  async findOne(id: string): Promise<Agreement> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const agreement = await this.agreementsRepository.findOne({
      where: { id },
    });

    if (!agreement) {
      throw new NotFoundException(`Acuerdo con ID ${id} no encontrado`);
    }

    return agreement;
  }

  /**
   * Actualizar un acuerdo
   */
  async update(
    id: string,
    updateAgreementDto: UpdateAgreementDto,
  ): Promise<Agreement> {
    // Verificar que el acuerdo existe
    await this.findOne(id);

    // Actualizar
    await this.agreementsRepository.update(id, updateAgreementDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un acuerdo
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el acuerdo existe
    await this.findOne(id);

    // Eliminar
    await this.agreementsRepository.delete(id);

    return {
      message: `Acuerdo con ID ${id} eliminado exitosamente`,
    };
  }
}
