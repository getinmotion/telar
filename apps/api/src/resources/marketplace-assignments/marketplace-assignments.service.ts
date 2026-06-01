import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { MarketplaceAssignment, MarketplaceKey } from './entities/marketplace-assignment.entity';
import {
  CreateMarketplaceAssignmentDto,
  RemoveMarketplaceAssignmentDto,
} from './dto/create-marketplace-assignment.dto';

@Injectable()
export class MarketplaceAssignmentsService {
  constructor(
    @Inject('MARKETPLACE_ASSIGNMENTS_REPOSITORY')
    private readonly repo: Repository<MarketplaceAssignment>,
  ) {}

  async assign(dto: CreateMarketplaceAssignmentDto): Promise<MarketplaceAssignment> {
    const existing = await this.repo.findOne({
      where: { productId: dto.productId, marketplaceKey: dto.marketplaceKey, removedAt: IsNull() },
    });
    if (existing) return existing;
    const assignment = this.repo.create(dto);
    return this.repo.save(assignment);
  }

  async remove(id: string, dto: RemoveMarketplaceAssignmentDto): Promise<MarketplaceAssignment> {
    const assignment = await this.findOne(id);
    assignment.removedAt = new Date();
    assignment.removalReason = dto.removalReason ?? null;
    return this.repo.save(assignment);
  }

  async findByMarketplace(key: MarketplaceKey): Promise<MarketplaceAssignment[]> {
    return this.repo.find({
      where: { marketplaceKey: key, removedAt: IsNull() },
      order: { assignedAt: 'DESC' },
    });
  }

  async findByProduct(productId: string): Promise<MarketplaceAssignment[]> {
    if (!productId) throw new BadRequestException('productId es requerido');
    return this.repo.find({
      where: { productId, removedAt: IsNull() },
      order: { assignedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MarketplaceAssignment> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const assignment = await this.repo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    return assignment;
  }

  async findAll(): Promise<MarketplaceAssignment[]> {
    return this.repo.find({ where: { removedAt: IsNull() }, order: { assignedAt: 'DESC' } });
  }
}
