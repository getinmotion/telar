import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArtisansKnowledgeService } from './artisans-knowledge.service';
import { CreateArtisansIdentityOneDto } from './dto/create-artisans-identity-one.dto';
import { CreateArtisansCommercialTwoDto } from './dto/create-artisans-commercial-two.dto';
import { CreateArtisansClientMarketThreeDto } from './dto/create-artisans-client-market-three.dto';
import { CreateArtisansOperationGrowthFourDto } from './dto/create-artisans-operation-growth-four.dto';
import { ArtisansIdentityProfile } from './entities/artisans-identity-profile.entity';

@ApiTags('Artisans Knowledge')
@Controller('artisans-knowledge')
export class ArtisansKnowledgeController {
  constructor(
    private readonly artisansKnowledgeService: ArtisansKnowledgeService,
  ) {}

  @Post('step-1/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Step 1: Identity One' })
  @ApiResponse({
    status: 201,
    description: 'Step 1 completed successfully',
    type: ArtisansIdentityProfile,
  })
  async createIdentityOne(
    @Param('userId') userId: string,
    @Body() dto: CreateArtisansIdentityOneDto,
  ): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.createIdentityOne(userId, dto);
  }

  @Post('step-2/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Step 2: Commercial Two' })
  @ApiResponse({
    status: 201,
    description: 'Step 2 completed successfully',
    type: ArtisansIdentityProfile,
  })
  async createCommercialTwo(
    @Param('userId') userId: string,
    @Body() dto: CreateArtisansCommercialTwoDto,
  ): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.createCommercialTwo(userId, dto);
  }

  @Post('step-3/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Step 3: Client Market Three' })
  @ApiResponse({
    status: 201,
    description: 'Step 3 completed successfully',
    type: ArtisansIdentityProfile,
  })
  async createClientMarketThree(
    @Param('userId') userId: string,
    @Body() dto: CreateArtisansClientMarketThreeDto,
  ): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.createClientMarketThree(
      userId,
      dto,
    );
  }

  @Post('step-4/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Step 4: Operation Growth Four' })
  @ApiResponse({
    status: 201,
    description: 'Step 4 completed successfully',
    type: ArtisansIdentityProfile,
  })
  async createOperationGrowthFour(
    @Param('userId') userId: string,
    @Body() dto: CreateArtisansOperationGrowthFourDto,
  ): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.createOperationGrowthFour(
      userId,
      dto,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get artisan knowledge profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ArtisansIdentityProfile,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.getByUserId(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all artisan knowledge profiles' })
  @ApiResponse({
    status: 200,
    description: 'List of all profiles',
    type: [ArtisansIdentityProfile],
  })
  async findAll(): Promise<ArtisansIdentityProfile[]> {
    return await this.artisansKnowledgeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artisan knowledge profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ArtisansIdentityProfile,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findOne(@Param('id') id: string): Promise<ArtisansIdentityProfile> {
    return await this.artisansKnowledgeService.findOne(id);
  }
}
