import { Injectable } from '@nestjs/common';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';

@Injectable()
export class TerritoriesService {
  create(createTerritoryDto: CreateTerritoryDto) {
    return 'This action adds a new territory';
  }

  findAll() {
    return `This action returns all territories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} territory`;
  }

  update(id: number, updateTerritoryDto: UpdateTerritoryDto) {
    return `This action updates a #${id} territory`;
  }

  remove(id: number) {
    return `This action removes a #${id} territory`;
  }
}
