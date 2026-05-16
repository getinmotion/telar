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
import { CraftsService } from './crafts.service';
import { CreateCraftDto } from './dto/create-craft.dto';
import { UpdateCraftDto } from './dto/update-craft.dto';
import { ApprovalStatus } from './entities/craft.entity';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';

class UpdateStatusDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  mergeIntoId?: string;
}

@Controller('crafts')
export class CraftsController {
  constructor(private readonly craftsService: CraftsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCraftDto: CreateCraftDto) {
    return this.craftsService.create(createCraftDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('suggestedBy') suggestedBy?: string,
  ) {
    return this.craftsService.findAll(search, status, suggestedBy);
  }

  @Get('active')
  findActive() {
    return this.craftsService.findActive();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.craftsService.findByStatus(status);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.craftsService.findByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.craftsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCraftDto: UpdateCraftDto) {
    return this.craftsService.update(id, updateCraftDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.craftsService.updateStatus(id, dto.status, dto.mergeIntoId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.craftsService.remove(id);
  }
}
