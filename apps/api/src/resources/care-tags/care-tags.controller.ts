import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CareTagsService } from './care-tags.service';
import { CreateCareTagDto } from './dto/create-care-tag.dto';
import { UpdateCareTagDto } from './dto/update-care-tag.dto';

@Controller('care-tags')
export class CareTagsController {
  constructor(private readonly careTagsService: CareTagsService) {}

  @Post()
  create(@Body() createCareTagDto: CreateCareTagDto) {
    return this.careTagsService.create(createCareTagDto);
  }

  @Get()
  findAll() {
    return this.careTagsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.careTagsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careTagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCareTagDto: UpdateCareTagDto) {
    return this.careTagsService.update(id, updateCareTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careTagsService.remove(id);
  }
}
