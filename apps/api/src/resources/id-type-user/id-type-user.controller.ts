import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IdTypeUserService } from './id-type-user.service';
import { IdTypeUser } from './entities/id-type-user.entity';

@Controller('id-type-user')
export class IdTypeUserController {
  constructor(private readonly idTypeUserService: IdTypeUserService) {}

  /**
   * GET /id-type-user
   * Obtener todos los tipos de identificación
   */
  @Get()
  findAll(): Promise<IdTypeUser[]> {
    return this.idTypeUserService.findAll();
  }

  /**
   * GET /id-type-user/:id
   * Obtener un tipo de identificación por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<IdTypeUser> {
    return this.idTypeUserService.findOne(id);
  }

  /**
   * GET /id-type-user/value/:idTypeValue
   * Obtener un tipo de identificación por su valor/código
   */
  @Get('value/:idTypeValue')
  findByValue(@Param('idTypeValue') idTypeValue: string): Promise<IdTypeUser> {
    return this.idTypeUserService.findByValue(idTypeValue);
  }

  /**
   * GET /id-type-user/country/:countryId
   * Obtener tipos de identificación por país
   */
  @Get('country/:countryId')
  findByCountry(@Param('countryId') countryId: string): Promise<IdTypeUser[]> {
    return this.idTypeUserService.findByCountry(countryId);
  }

  /**
   * POST /id-type-user
   * Crear un nuevo tipo de identificación
   */
  @Post()
  create(
    @Body()
    createData: {
      idTypeValue: string;
      typeName: string;
      countriesId: string;
    },
  ): Promise<IdTypeUser> {
    return this.idTypeUserService.create(createData);
  }

  /**
   * PATCH /id-type-user/:id
   * Actualizar un tipo de identificación
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateData: Partial<{
      idTypeValue: string;
      typeName: string;
      countriesId: string;
    }>,
  ): Promise<IdTypeUser> {
    return this.idTypeUserService.update(id, updateData);
  }

  /**
   * DELETE /id-type-user/:id
   * Eliminar un tipo de identificación
   */
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.idTypeUserService.remove(id);
  }
}
