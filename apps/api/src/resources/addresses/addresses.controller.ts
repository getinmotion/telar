import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva dirección' })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada exitosamente',
    type: Address,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  create(@Body() createAddressDto: CreateAddressDto): Promise<Address> {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las direcciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de direcciones',
    type: [Address],
  })
  findAll(): Promise<Address[]> {
    return this.addressesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener direcciones por userId' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de direcciones del usuario',
    type: [Address],
  })
  @ApiResponse({ status: 400, description: 'userId inválido' })
  findByUserId(@Param('userId') userId: string): Promise<Address[]> {
    return this.addressesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una dirección por ID' })
  @ApiParam({ name: 'id', description: 'ID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección encontrada',
    type: Address,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  findOne(@Param('id') id: string): Promise<Address> {
    return this.addressesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una dirección' })
  @ApiParam({ name: 'id', description: 'ID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada exitosamente',
    type: Address,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    return this.addressesService.update(id, updateAddressDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Establecer una dirección como predeterminada' })
  @ApiParam({ name: 'id', description: 'ID de la dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección establecida como predeterminada',
    type: Address,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  setAsDefault(@Param('id') id: string): Promise<Address> {
    return this.addressesService.setAsDefault(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una dirección' })
  @ApiParam({ name: 'id', description: 'ID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.addressesService.remove(id);
  }
}
