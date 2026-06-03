import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PayoutUserInfoService } from './payout-user-info.service';
import { CreatePayoutUserInfoDto } from './dto/create-payout-user-info.dto';
import { UpdatePayoutUserInfoDto } from './dto/update-payout-user-info.dto';
import { PayoutUserInfo } from './entities/payout-user-info.entity';

@ApiTags('Payout User Info')
@Controller('payout-user-info')
export class PayoutUserInfoController {
  constructor(
    private readonly payoutUserInfoService: PayoutUserInfoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva información de payout' })
  @ApiResponse({
    status: 201,
    description: 'Información de payout creada exitosamente',
    type: PayoutUserInfo,
  })
  create(
    @Body() createPayoutUserInfoDto: CreatePayoutUserInfoDto,
  ): Promise<PayoutUserInfo> {
    return this.payoutUserInfoService.create(createPayoutUserInfoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las informaciones de payout' })
  @ApiResponse({
    status: 200,
    description: 'Lista de informaciones de payout',
    type: [PayoutUserInfo],
  })
  getAll(): Promise<PayoutUserInfo[]> {
    return this.payoutUserInfoService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de payout por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro' })
  @ApiResponse({
    status: 200,
    description: 'Información de payout encontrada',
    type: PayoutUserInfo,
  })
  @ApiResponse({ status: 404, description: 'Información no encontrada' })
  getById(@Param('id') id: string): Promise<PayoutUserInfo> {
    return this.payoutUserInfoService.getById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener información de payout por ID de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de información de payout del usuario',
    type: [PayoutUserInfo],
  })
  getByUserId(@Param('userId') userId: string): Promise<PayoutUserInfo[]> {
    return this.payoutUserInfoService.getByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de payout' })
  @ApiParam({ name: 'id', description: 'ID del registro' })
  @ApiResponse({
    status: 200,
    description: 'Información de payout actualizada exitosamente',
    type: PayoutUserInfo,
  })
  @ApiResponse({ status: 404, description: 'Información no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updatePayoutUserInfoDto: UpdatePayoutUserInfoDto,
  ): Promise<PayoutUserInfo> {
    return this.payoutUserInfoService.update(id, updatePayoutUserInfoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar información de payout' })
  @ApiParam({ name: 'id', description: 'ID del registro' })
  @ApiResponse({
    status: 200,
    description: 'Información de payout eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Información no encontrada' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.payoutUserInfoService.delete(id);
  }
}
