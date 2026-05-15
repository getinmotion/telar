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
import { TaxonomyStylesService } from './taxonomy-styles.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { StyleStatus } from './entities/style.entity';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(StyleStatus)
  status: StyleStatus;

  @IsOptional()
  @IsUUID()
  mergeIntoId?: string;
}

@Controller('taxonomy/styles')
export class TaxonomyStylesController {
  constructor(private readonly service: TaxonomyStylesService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.service.findAll(search, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateStyleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateStyleDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.mergeIntoId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
