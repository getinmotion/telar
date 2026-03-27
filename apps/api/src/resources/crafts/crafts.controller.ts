import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CraftsService } from './crafts.service';
import { CreateCraftDto } from './dto/create-craft.dto';
import { UpdateCraftDto } from './dto/update-craft.dto';

@Controller('crafts')
export class CraftsController {
  constructor(private readonly craftsService: CraftsService) {}

  @Post()
  create(@Body() createCraftDto: CreateCraftDto) {
    return this.craftsService.create(createCraftDto);
  }

  @Get()
  findAll() {
    return this.craftsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.craftsService.findActive();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.craftsService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.craftsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCraftDto: UpdateCraftDto) {
    return this.craftsService.update(id, updateCraftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.craftsService.remove(id);
  }
}
