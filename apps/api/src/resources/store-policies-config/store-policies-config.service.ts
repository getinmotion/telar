import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { StorePoliciesConfig } from './entities/store-policies-config.entity';
import { CreateStorePoliciesConfigDto } from './dto/create-store-policies-config.dto';
import { UpdateStorePoliciesConfigDto } from './dto/update-store-policies-config.dto';

@Injectable()
export class StorePoliciesConfigService {
  constructor(
    @Inject('STORE_POLICIES_CONFIG_REPOSITORY')
    private readonly repo: Repository<StorePoliciesConfig>,
  ) {}

  async create(
    createDto: CreateStorePoliciesConfigDto,
  ): Promise<StorePoliciesConfig> {
    const record = this.repo.create({
      returnPolicy: createDto.returnPolicy ?? null,
      faq: createDto.faq ?? null,
    });
    return await this.repo.save(record);
  }

  async getById(id: string): Promise<StorePoliciesConfig> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const record = await this.repo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(
        `Configuración de políticas con ID ${id} no encontrada`,
      );
    }

    return record;
  }

  async update(
    id: string,
    updateDto: UpdateStorePoliciesConfigDto,
  ): Promise<StorePoliciesConfig> {
    await this.getById(id);
    await this.repo.update(id, updateDto);
    return await this.getById(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);
    await this.repo.delete(id);
    return { message: `Configuración de políticas con ID ${id} eliminada exitosamente` };
  }
}
