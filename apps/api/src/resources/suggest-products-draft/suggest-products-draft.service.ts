import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SuggestProductsDraft } from './entities/suggest-products-draft.entity';
import { CreateSuggestProductsDraftDto } from './dto/create-suggest-products-draft.dto';
import { UpdateSuggestProductsDraftDto } from './dto/update-suggest-products-draft.dto';
import { SuggestProductsDraftResponseDto } from './dto/suggest-products-draft-response.dto';

@Injectable()
export class SuggestProductsDraftService {
  constructor(
    @Inject('SUGGEST_PRODUCTS_DRAFT_REPOSITORY')
    private readonly repository: Repository<SuggestProductsDraft>,
  ) {}

  /**
   * Crear un nuevo registro de sugerencias
   */
  async create(
    createDto: CreateSuggestProductsDraftDto,
  ): Promise<SuggestProductsDraftResponseDto> {
    const newRecord = this.repository.create(createDto);
    const saved = await this.repository.save(newRecord);
    return this.mapToResponseDto(saved);
  }

  /**
   * Obtener todos los registros
   */
  async findAll(): Promise<SuggestProductsDraftResponseDto[]> {
    const records = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return records.map((record) => this.mapToResponseDto(record));
  }

  /**
   * Obtener un registro por ID
   */
  async findOne(id: string): Promise<SuggestProductsDraftResponseDto> {
    const record = await this.repository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(
        `Suggest products draft with ID ${id} not found`,
      );
    }

    return this.mapToResponseDto(record);
  }

  /**
   * Obtener un registro por product_id
   */
  async findByProductId(
    productId: string,
  ): Promise<SuggestProductsDraftResponseDto | null> {
    const record = await this.repository.findOne({ where: { productId } });

    if (!record) {
      return null;
    }

    return this.mapToResponseDto(record);
  }

  /**
   * Actualizar un registro existente
   */
  async update(
    id: string,
    updateDto: UpdateSuggestProductsDraftDto,
  ): Promise<SuggestProductsDraftResponseDto> {
    const record = await this.repository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(
        `Suggest products draft with ID ${id} not found`,
      );
    }

    // Actualizar campos
    Object.assign(record, updateDto);
    const updated = await this.repository.save(record);

    return this.mapToResponseDto(updated);
  }

  /**
   * Actualizar o crear un registro por product_id
   */
  async upsertByProductId(
    productId: string,
    data: Partial<CreateSuggestProductsDraftDto>,
  ): Promise<SuggestProductsDraftResponseDto> {
    const existing = await this.repository.findOne({ where: { productId } });

    if (existing) {
      // Actualizar existente
      Object.assign(existing, data);
      const updated = await this.repository.save(existing);
      return this.mapToResponseDto(updated);
    } else {
      // Crear nuevo
      const newRecord = this.repository.create({ productId, ...data });
      const saved = await this.repository.save(newRecord);
      return this.mapToResponseDto(saved);
    }
  }

  /**
   * Eliminar un registro
   */
  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Suggest products draft with ID ${id} not found`,
      );
    }
  }

  /**
   * Mapear entity a DTO de respuesta
   */
  private mapToResponseDto(
    entity: SuggestProductsDraft,
  ): SuggestProductsDraftResponseDto {
    return {
      id: entity.id,
      productId: entity.productId,
      suggestAgentStep12: entity.suggestAgentStep12,
      suggestAgentStep34: entity.suggestAgentStep34,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
