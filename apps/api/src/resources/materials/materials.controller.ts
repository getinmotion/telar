import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApprovalStatus } from './entities/material.entity';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';

class UpdateStatusDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  mergeIntoId?: string;
}

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('suggestedBy') suggestedBy?: string,
  ) {
    return this.materialsService.findAll(search, status, suggestedBy);
  }

  @Get('organic')
  findOrganic() {
    return this.materialsService.findOrganic();
  }

  @Get('sustainable')
  findSustainable() {
    return this.materialsService.findSustainable();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.materialsService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.materialsService.updateStatus(id, dto.status, dto.mergeIntoId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
