import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMaestro } from './entities/artisan-maestro.entity';
import { CreateArtisanMaestroDto } from './dto/create-artisan-maestro.dto';
import { resolveArtisanProfileId } from '../../utils/resolve-artisan-profile-id.util';

@Injectable()
export class ArtisanMaestrosService {
  constructor(
    @Inject('ARTISAN_MAESTROS_REPOSITORY')
    private readonly repo: Repository<ArtisanMaestro>,
  ) {}

  async create(dto: CreateArtisanMaestroDto): Promise<ArtisanMaestro> {
    const artisanId = await resolveArtisanProfileId(this.repo, dto.artisanId);
    const maestro = this.repo.create({ artisanId, name: dto.name, description: dto.description ?? null });
    return this.repo.save(maestro);
  }

  async findByArtisan(artisanId: string): Promise<ArtisanMaestro[]> {
    const resolvedId = await resolveArtisanProfileId(this.repo, artisanId);
    return this.repo.find({
      where: { artisanId: resolvedId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const maestro = await this.repo.findOne({ where: { id } });
    if (!maestro) throw new NotFoundException(`Maestro con ID ${id} no encontrado`);
    await this.repo.delete(id);
    return { message: `Maestro eliminado` };
  }
}
