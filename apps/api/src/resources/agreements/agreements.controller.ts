import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  create(@Body() createAgreementDto: CreateAgreementDto) {
    return this.agreementsService.create(createAgreementDto);
  }

  @Get()
  findAll() {
    return this.agreementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agreementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgreementDto: UpdateAgreementDto) {
    return this.agreementsService.update(+id, updateAgreementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agreementsService.remove(+id);
  }
}
