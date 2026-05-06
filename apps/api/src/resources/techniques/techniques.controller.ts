import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TechniquesService } from './techniques.service';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';

@Controller('techniques')
export class TechniquesController {
  constructor(private readonly techniquesService: TechniquesService) {}

  @Post()
  create(@Body() createTechniqueDto: CreateTechniqueDto) {
    return this.techniquesService.create(createTechniqueDto);
  }

  @Get()
  findAll(@Query('withProductCount') withProductCount?: string) {
    if (withProductCount === 'true' || withProductCount === '1') {
      return this.techniquesService.findAllWithProductCount();
    }
    return this.techniquesService.findAll();
  }

  @Get('craft/:craftId')
  findByCraftId(@Param('craftId') craftId: string) {
    return this.techniquesService.findByCraftId(craftId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.techniquesService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.techniquesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTechniqueDto: UpdateTechniqueDto) {
    return this.techniquesService.update(id, updateTechniqueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.techniquesService.remove(id);
  }
}
