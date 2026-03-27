import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuratorialCategoriesService } from './curatorial-categories.service';
import { CreateCuratorialCategoryDto } from './dto/create-curatorial-category.dto';
import { UpdateCuratorialCategoryDto } from './dto/update-curatorial-category.dto';

@Controller('curatorial-categories')
export class CuratorialCategoriesController {
  constructor(private readonly curatorialCategoriesService: CuratorialCategoriesService) {}

  @Post()
  create(@Body() createCuratorialCategoryDto: CreateCuratorialCategoryDto) {
    return this.curatorialCategoriesService.create(createCuratorialCategoryDto);
  }

  @Get()
  findAll() {
    return this.curatorialCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curatorialCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCuratorialCategoryDto: UpdateCuratorialCategoryDto) {
    return this.curatorialCategoriesService.update(id, updateCuratorialCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curatorialCategoriesService.remove(id);
  }
}
