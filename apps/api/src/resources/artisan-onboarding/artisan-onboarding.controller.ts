import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ArtisanOnboardingService } from './artisan-onboarding.service';
import { UpsertOnboardingDto } from './dto/upsert-onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

function ensureSelfOrAdmin(req: Request, userId: string): void {
  const caller = (req as any).user ?? {};
  const isSelf = caller.sub === userId || caller.id === userId;
  const isAdmin = caller.isSuperAdmin === true;
  if (!isSelf && !isAdmin) {
    throw new ForbiddenException('You can only access your own onboarding data');
  }
}

@ApiTags('artisan-onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('artisan-onboarding')
export class ArtisanOnboardingController {
  constructor(private readonly service: ArtisanOnboardingService) {}

  @ApiOperation({ summary: 'Get all 16 onboarding answers for a user' })
  @Get(':userId')
  getByUserId(@Param('userId') userId: string, @Req() req: Request) {
    ensureSelfOrAdmin(req, userId);
    return this.service.getByUserId(userId);
  }

  @ApiOperation({ summary: 'Upsert onboarding answers — distributes to the correct entities' })
  @Patch(':userId')
  upsert(
    @Param('userId') userId: string,
    @Body() dto: UpsertOnboardingDto,
    @Req() req: Request,
  ) {
    ensureSelfOrAdmin(req, userId);
    return this.service.upsertByUserId(userId, dto);
  }
}
