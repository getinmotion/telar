import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { OnboardingRequestDto } from './dto/onboarding-request.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { Step1InitialCaptureRequestDto } from './dto/step-1-initial-capture-request.dto';
import { Step1InitialCaptureResponseDto } from './dto/step-1-initial-capture-response.dto';
import { Step1ConfirmRequestDto } from './dto/step-1-confirm-request.dto';
import { Step1ConfirmResponseDto } from './dto/step-1-confirm-response.dto';
import { Step2CaptureRequestDto } from './dto/step-2-capture-request.dto';
import { Step2CaptureResponseDto } from './dto/step-2-capture-response.dto';
import { Step2ConfirmRequestDto } from './dto/step-2-confirm-request.dto';
import { Step2ConfirmResponseDto } from './dto/step-2-confirm-response.dto';

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

  /**
   * Endpoint para paso 1: Captura inicial del producto
   */
  @Post('product/step-1-initial-capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paso 1: Captura inicial del producto',
    description: 'Envía la información básica del producto al servicio de agentes para análisis, mejora de contenido y sugerencias de identidad artesanal',
  })
  @ApiResponse({
    status: 200,
    description: 'Captura inicial procesada exitosamente',
    type: Step1InitialCaptureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar la captura inicial en el servicio de agentes',
  })
  async step1InitialCapture(
    @Body() data: Step1InitialCaptureRequestDto,
  ): Promise<Step1InitialCaptureResponseDto> {
    return await this.agentService.step1InitialCapture(data);
  }

  /**
   * Endpoint para paso 1 confirm: Confirmación de identidad artesanal
   */
  @Post('product/step-1-confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paso 1 Confirm: Confirmación de identidad artesanal',
    description: 'Envía la confirmación de las sugerencias de identidad artesanal (categoría, oficio, materiales) para el producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Confirmación procesada exitosamente',
    type: Step1ConfirmResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar la confirmación en el servicio de agentes',
  })
  async step1Confirm(
    @Body() data: Step1ConfirmRequestDto,
  ): Promise<Step1ConfirmResponseDto> {
    return await this.agentService.step1Confirm(data);
  }

  /**
   * Endpoint para paso 2 capture: Registro del proceso de elaboración
   */
  @Post('product/step-2-capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paso 2 Capture: Registro del proceso de elaboración',
    description: 'Envía la descripción del proceso y evidencias fotográficas para análisis de fases, tiempos y pricing',
  })
  @ApiResponse({
    status: 200,
    description: 'Proceso registrado exitosamente',
    type: Step2CaptureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar el registro del proceso en el servicio de agentes',
  })
  async step2Capture(
    @Body() data: Step2CaptureRequestDto,
  ): Promise<Step2CaptureResponseDto> {
    return await this.agentService.step2Capture(data);
  }

  /**
   * Endpoint para paso 2 confirm: Confirmación de pricing y logística
   */
  @Post('product/step-2-confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paso 2 Confirm: Confirmación de pricing y logística',
    description: 'Envía la confirmación de proceso, pricing, logística y disponibilidad del producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Confirmación procesada exitosamente',
    type: Step2ConfirmResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar la confirmación en el servicio de agentes',
  })
  async step2Confirm(
    @Body() data: Step2ConfirmRequestDto,
  ): Promise<Step2ConfirmResponseDto> {
    return await this.agentService.step2Confirm(data);
  }
}
