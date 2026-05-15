import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModerationQueueService } from './moderation-queue.service';
import { UpsertQueueScoreDto } from './dto/upsert-queue-score.dto';
import { QueueScore } from './entities/queue-score.entity';

@ApiTags('moderation-queue')
@Controller('moderation-queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ModerationQueueController {
  constructor(private readonly moderationQueueService: ModerationQueueService) {}

  @Post('scores')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Crear o actualizar score de un item de la cola' })
  @ApiResponse({ status: 200, type: QueueScore })
  async upsertScore(@Body() dto: UpsertQueueScoreDto): Promise<QueueScore> {
    return this.moderationQueueService.upsertScore(dto);
  }

  @Get('scores/:itemId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Obtener score de un item por ID' })
  @ApiResponse({ status: 200, type: QueueScore })
  async findScore(@Param('itemId') itemId: string): Promise<QueueScore | null> {
    return this.moderationQueueService.findByItemId(itemId);
  }

  @Delete('scores/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar score de un item' })
  @ApiResponse({ status: 204 })
  async deleteScore(@Param('itemId') itemId: string): Promise<void> {
    return this.moderationQueueService.deleteByItemId(itemId);
  }
}
