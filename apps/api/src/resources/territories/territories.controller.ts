import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TerritoriesService } from './territories.service';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';

@Controller('territories')
export class TerritoriesController {
  constructor(private readonly territoriesService: TerritoriesService) {}

  @Post()
  create(@Body() createTerritoryDto: CreateTerritoryDto) {
    return this.territoriesService.create(createTerritoryDto);
  }

  @Get()
  findAll() {
    return this.territoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.territoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTerritoryDto: UpdateTerritoryDto) {
    return this.territoriesService.update(+id, updateTerritoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.territoriesService.remove(+id);
  }
}
