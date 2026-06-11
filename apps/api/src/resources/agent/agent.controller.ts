import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { OnboardingRequestDto } from './dto/onboarding-request.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';

/**
 * Controlador puente para realizar peticiones al servicio de agentes
 */
@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * Endpoint de prueba para verificar que el servicio está funcionando
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check del servicio de agentes' })
  @ApiResponse({
    status: 200,
    description: 'Estado del servicio de agentes',
    schema: {
      example: {
        status: 'ok',
        agentUrl: 'http://localhost:8000',
        message: 'Agent service is configured and ready',
      },
    },
  })
  healthCheck(): {
    status: string;
    agentUrl: string;
    message: string;
  } {
    const agentUrl = this.agentService.getAgentUrl();
    return {
      status: agentUrl ? 'ok' : 'error',
      agentUrl: agentUrl || 'not configured',
      message: agentUrl
        ? 'Agent service is configured and ready'
        : 'AGENT_URL is not configured',
    };
  }

  /**
   * Endpoint para procesar onboarding de artesano
   */
  @Post('onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Procesar onboarding de artesano',
    description: 'Envía los datos del perfil de conocimiento artesanal al servicio de agentes para procesamiento de onboarding',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding procesado exitosamente',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar onboarding en el servicio de agentes',
  })
  async processOnboarding(
    @Body() onboardingData: OnboardingRequestDto,
  ): Promise<OnboardingResponseDto> {
    return await this.agentService.processOnboarding(onboardingData);
  }
}
