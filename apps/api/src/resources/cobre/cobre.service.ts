import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  CobreAuthResponse,
  CobreCounterpartyResponse,
} from './dto/cobre-auth-response.dto';
import { ArtisanShopsService } from '../artisan-shops/artisan-shops.service';
import { BankDataDto } from './dto/create-counterparty-admin.dto';
import { CreateCounterpartySelfDto } from './dto/create-counterparty-self.dto';

@Injectable()
export class CobreService {
  private readonly logger = new Logger(CobreService.name);
  private readonly cobreApiKey: string | undefined;
  private readonly cobreApiSecret: string | undefined;
  private readonly cobreBaseUrl: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly artisanShopsService: ArtisanShopsService,
  ) {
    this.cobreApiKey = this.configService.get<string>('COBRE_API_KEY');
    this.cobreApiSecret = this.configService.get<string>('COBRE_API_SECRET');
    this.cobreBaseUrl = this.configService.get<string>('COBRE_URL');

    if (!this.cobreApiKey || !this.cobreApiSecret || !this.cobreBaseUrl) {
      this.logger.error(
        'Missing Cobre environment variables: COBRE_API_KEY, COBRE_API_SECRET, or COBRE_URL',
      );
    }
  }

  /**
   * Autenticar con la API de Cobre y obtener access token
   */
  private async authenticate(): Promise<string> {
    if (!this.cobreApiKey || !this.cobreApiSecret || !this.cobreBaseUrl) {
      throw new InternalServerErrorException(
        'API configuration missing. Check COBRE_API_KEY, COBRE_API_SECRET, and COBRE_URL.',
      );
    }

    try {
      this.logger.debug('Authenticating with Cobre API...');

      const response = await firstValueFrom(
        this.httpService.post<CobreAuthResponse>(
          `${this.cobreBaseUrl}/v1/auth`,
          {
            user_id: this.cobreApiKey,
            secret: this.cobreApiSecret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      );

      if (!response.data.access_token) {
        this.logger.error('Cobre Auth Error: No access token received');
        throw new InternalServerErrorException(
          'Cobre Authentication Failed: No access token received',
        );
      }

      this.logger.debug('Successfully authenticated with Cobre API');
      return response.data.access_token;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.message || 'Unknown error';
        this.logger.error('Cobre Authentication Error:', errorMessage);

        if (error.response) {
          const status = error.response.status;
          const data: unknown = error.response.data;
          this.logger.error(`Cobre Auth API Error (${status}):`, data);

          throw new InternalServerErrorException({
            error: 'Cobre Authentication Failed',
            status,
            details: data as Record<string, unknown>,
          });
        }

        throw new InternalServerErrorException({
          error: 'Cobre Authentication Failed',
          message: errorMessage,
        });
      }

      // Handle non-Axios errors
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Cobre Authentication Error:', message);
      throw new InternalServerErrorException({
        error: 'Cobre Authentication Failed',
        message,
      });
    }
  }

  /**
   * Obtener datos de una contraparte (counterparty) de Cobre
   */
  async getCounterparty(
    counterpartyId: string,
  ): Promise<CobreCounterpartyResponse> {
    if (!counterpartyId || typeof counterpartyId !== 'string') {
      throw new BadRequestException(
        'counterparty_id (string) is required and must be a valid string',
      );
    }

    try {
      // Autenticar primero
      const accessToken = await this.authenticate();

      this.logger.debug(`Fetching counterparty data for ID: ${counterpartyId}`);

      // Obtener datos de la contraparte
      const response = await firstValueFrom(
        this.httpService.get<CobreCounterpartyResponse>(
          `${this.cobreBaseUrl}/v1/counterparties/${counterpartyId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      this.logger.debug(
        `Successfully fetched counterparty data for ID: ${counterpartyId}`,
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.message || 'Unknown error';
        this.logger.error('Cobre API Error:', errorMessage);

        if (error.response) {
          const status = error.response.status;
          const data: unknown = error.response.data;
          this.logger.error(`Cobre API Error (${status}):`, data);

          throw new InternalServerErrorException({
            error: 'Cobre API Error',
            status,
            details: data as Record<string, unknown>,
          });
        }

        throw new InternalServerErrorException({
          error: 'Cobre API Error',
          message: errorMessage,
        });
      }

      // Handle non-Axios errors
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Cobre API Error:', message);
      throw new InternalServerErrorException({
        error: 'Internal Server Error',
        message,
      });
    }
  }

  /**
   * Crear una contraparte (counterparty) en Cobre para una tienda (acción de administrador)
   * Actualiza el campo id_contraparty de la tienda con el ID devuelto por Cobre.
   */
  async createCounterpartyAdmin(
    shopId: string,
    bankData: BankDataDto,
  ): Promise<{ id_contraparty: string }> {
    if (!shopId) {
      throw new BadRequestException('shopId es requerido');
    }

    const accessToken = await this.authenticate();

    const payload = {
      geo: 'col',
      type: bankData.account_type,
      alias: `${bankData.holder_name} - ${bankData.account_type}`,
      metadata: {
        account_number: bankData.account_number,
        beneficiary_institution: bankData.bank_code,
        counterparty_fullname: bankData.holder_name,
        counterparty_id_number: bankData.document_number,
        counterparty_id_type: bankData.document_type,
      },
    };

    try {
      this.logger.debug(`Creating counterparty for shop ${shopId}`);

      const response = await firstValueFrom(
        this.httpService.post<{ id: string }>(
          `${this.cobreBaseUrl}/v1/counterparties`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      const counterpartyId = response.data?.id;
      if (!counterpartyId) {
        throw new InternalServerErrorException('Cobre no retornó un ID de contraparte');
      }

      // Persistir el id_contraparty en la tienda
      await this.artisanShopsService.update(shopId, {
        idContraparty: counterpartyId,
        bankDataStatus: 'complete',
      });

      this.logger.debug(`Counterparty ${counterpartyId} linked to shop ${shopId}`);
      return { id_contraparty: counterpartyId };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data: unknown = error.response?.data;
        this.logger.error(`Cobre Create Counterparty Error (${status}):`, data);
        throw new InternalServerErrorException({
          error: 'Cobre API Error',
          status,
          details: data as Record<string, unknown>,
        });
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Create Counterparty Admin Error:', message);
      throw new InternalServerErrorException({ error: 'Internal Server Error', message });
    }
  }

  /**
   * Crear o reemplazar contraparte para el propio artesano.
   * Localiza la tienda por userId, crea la contraparte en Cobre y actualiza id_contraparty.
   */
  async createCounterpartySelf(
    dto: CreateCounterpartySelfDto,
  ): Promise<{ id_contraparty: string }> {
    const shop = await this.artisanShopsService.getByUserId(dto.userId);
    if (!shop) {
      throw new BadRequestException('No se encontró una tienda para este usuario');
    }
    return this.createCounterpartyAdmin(shop.id, dto.bankData);
  }
}
