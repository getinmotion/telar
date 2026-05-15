import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStatsService } from './admin-stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin-stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin-stats')
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('comercial')
  @ApiOperation({ summary: 'Stats comerciales: GMV por canal, región, tiendas top, recompra' })
  getComercialStats() {
    return this.adminStatsService.getComercialStats();
  }
}
