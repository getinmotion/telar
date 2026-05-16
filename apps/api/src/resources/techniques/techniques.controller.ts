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
import { TechniquesService } from './techniques.service';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { ApprovalStatus } from './entities/technique.entity';
import { JwtAuthGuard } from 'src/resources/auth/guards/jwt-auth.guard';

class UpdateStatusDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  mergeIntoId?: string;
}

@Controller('techniques')
export class TechniquesController {
  constructor(private readonly techniquesService: TechniquesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createTechniqueDto: CreateTechniqueDto) {
    return this.techniquesService.create(createTechniqueDto);
  }

  @Get()
  findAll(
    @Query('withProductCount') withProductCount?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('suggestedBy') suggestedBy?: string,
  ) {
    if (withProductCount === 'true' || withProductCount === '1') {
      return this.techniquesService.findAllWithProductCount();
    }
    return this.techniquesService.findAll(search, status, suggestedBy);
  }

  @Get('craft/:craftId')
  findByCraftId(
    @Param('craftId') craftId: string,
    @Query('status') status?: string,
  ) {
    return this.techniquesService.findByCraftId(craftId, status);
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
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTechniqueDto: UpdateTechniqueDto) {
    return this.techniquesService.update(id, updateTechniqueDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.techniquesService.updateStatus(id, dto.status, dto.mergeIntoId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.techniquesService.remove(id);
  }
}
