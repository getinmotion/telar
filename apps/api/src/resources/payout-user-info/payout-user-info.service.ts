import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePayoutUserInfoDto } from './dto/create-payout-user-info.dto';
import { UpdatePayoutUserInfoDto } from './dto/update-payout-user-info.dto';
import { PayoutUserInfo } from './entities/payout-user-info.entity';
import { PayoutUserInfoResponseDto } from './dto/payout-user-info-response.dto';
import { EncryptionService } from 'src/common/services/encryption.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { ArtisanShopsService } from '../artisan-shops/artisan-shops.service';

@Injectable()
export class PayoutUserInfoService {
  constructor(
    @Inject('PAYOUT_USER_INFO_REPOSITORY')
    private readonly payoutUserInfoRepository: Repository<PayoutUserInfo>,
    private readonly encryptionService: EncryptionService,
    private readonly userProfilesService: UserProfilesService,
    private readonly artisanShopsService: ArtisanShopsService,
  ) {}

  async create(
    createPayoutUserInfoDto: CreatePayoutUserInfoDto,
  ): Promise<PayoutUserInfo> {
    // 1. Validar y actualizar perfil del usuario si es necesario
    const userProfile = await this.userProfilesService.getByUserId(
      createPayoutUserInfoDto.userId,
    );

    if (userProfile) {
      // Verificar si necesitamos actualizar idType o idNumber
      const needsUpdate =
        !userProfile.idType || !userProfile.idNumber;

      if (needsUpdate) {
        const updateData: any = {};

        if (!userProfile.idType) {
          updateData.idType = createPayoutUserInfoDto.idType;
        }

        if (!userProfile.idNumber) {
          updateData.idNumber = createPayoutUserInfoDto.idNumber;
        }

        // Actualizar el perfil con los datos faltantes
        await this.userProfilesService.update(userProfile.id, updateData);
      }
    }

    // 2. Preparar datos para PayoutUserInfo (sin idType e idNumber)
    const { idType, idNumber, ...payoutData } = createPayoutUserInfoDto;

    // 3. Encriptar datos sensibles
    const encryptedData = {
      ...payoutData,
      bankName: this.encryptionService.encrypt(payoutData.bankName),
      numAccount: this.encryptionService.encrypt(payoutData.numAccount),
    };

    // 4. Crear y guardar el registro de payout
    const payoutInfo = this.payoutUserInfoRepository.create(encryptedData);
    const savedPayoutInfo = await this.payoutUserInfoRepository.save(payoutInfo);

    // 5. Actualizar bank_data_status en artisan_shops a 'complete'
    const artisanShop = await this.artisanShopsService.getByUserId(
      createPayoutUserInfoDto.userId,
    );
    if (artisanShop) {
      await this.artisanShopsService.update(artisanShop.id, {
        bankDataStatus: 'complete',
      });
    }

    return savedPayoutInfo;
  }

  async getAll(): Promise<PayoutUserInfoResponseDto[]> {
    const payoutInfoList = await this.payoutUserInfoRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    // Desencriptar y agregar datos del perfil
    return await Promise.all(
      payoutInfoList.map((info) => this.enrichWithProfileData(info)),
    );
  }

  async getById(id: string): Promise<PayoutUserInfoResponseDto> {
    if (!id) {
      throw new BadRequestException('ID es requerido');
    }

    const payoutInfo = await this.payoutUserInfoRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!payoutInfo) {
      throw new NotFoundException(
        `Información de payout con ID ${id} no encontrada`,
      );
    }

    // Desencriptar y agregar datos del perfil
    return await this.enrichWithProfileData(payoutInfo);
  }

  async getByUserId(userId: string): Promise<PayoutUserInfoResponseDto[]> {
    if (!userId) {
      throw new BadRequestException('ID de usuario es requerido');
    }

    const payoutInfoList = await this.payoutUserInfoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    // Desencriptar y agregar datos del perfil
    return await Promise.all(
      payoutInfoList.map((info) => this.enrichWithProfileData(info)),
    );
  }

  /**
   * Desencripta los campos sensibles de un registro de payout
   * @param payoutInfo - Registro con datos encriptados
   * @returns Registro con datos desencriptados
   */
  private decryptPayoutInfo(payoutInfo: PayoutUserInfo): PayoutUserInfo {
    payoutInfo.bankName = this.encryptionService.decrypt(payoutInfo.bankName);
    payoutInfo.numAccount = this.encryptionService.decrypt(
      payoutInfo.numAccount,
    );
    return payoutInfo;
  }

  /**
   * Enriquece el registro de payout con datos del perfil del usuario
   * @param payoutInfo - Registro de payout
   * @returns Registro enriquecido con idType e idNumber del perfil
   */
  private async enrichWithProfileData(
    payoutInfo: PayoutUserInfo,
  ): Promise<PayoutUserInfoResponseDto> {
    // Desencriptar datos del payout
    const decryptedPayoutInfo = this.decryptPayoutInfo(payoutInfo);

    // Obtener perfil del usuario (ya viene con idNumber desencriptado)
    const userProfile = await this.userProfilesService.getByUserId(
      payoutInfo.userId,
    );

    // Agregar datos del perfil al objeto (mantiene la instancia de TypeORM)
    const response = decryptedPayoutInfo as PayoutUserInfoResponseDto;
    response.idType = userProfile?.idType ?? undefined;
    response.idNumber = userProfile?.idNumber ?? undefined; // Ya viene desencriptado del service

    return response;
  }

  async update(
    id: string,
    updatePayoutUserInfoDto: UpdatePayoutUserInfoDto,
  ): Promise<PayoutUserInfo> {
    const existing = await this.getById(id);

    // 1. Extraer idType e idNumber del DTO (pertenecen a UserProfile, no a PayoutUserInfo)
    const { idType, idNumber, ...payoutData } = updatePayoutUserInfoDto;

    // 2. Si vienen idType o idNumber, actualizar el UserProfile
    if (idType || idNumber) {
      const userProfile = await this.userProfilesService.getByUserId(
        existing.userId,
      );
      if (userProfile) {
        const updateData: any = {};
        if (idType) updateData.idType = idType;
        if (idNumber) updateData.idNumber = idNumber;
        await this.userProfilesService.update(userProfile.id, updateData);
      }
    }

    // 3. Encriptar datos sensibles si vienen en el update
    const dataToUpdate: any = { ...payoutData };
    if (payoutData.bankName) {
      dataToUpdate.bankName = this.encryptionService.encrypt(
        payoutData.bankName,
      );
    }
    if (payoutData.numAccount) {
      dataToUpdate.numAccount = this.encryptionService.encrypt(
        payoutData.numAccount,
      );
    }

    // 4. Actualizar solo los campos que pertenecen a PayoutUserInfo
    await this.payoutUserInfoRepository.update(id, dataToUpdate);

    return await this.getById(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);

    await this.payoutUserInfoRepository.delete(id);

    return {
      message: `Información de payout con ID ${id} eliminada exitosamente`,
    };
  }
}
