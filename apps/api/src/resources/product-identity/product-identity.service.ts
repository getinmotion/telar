import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';
import { ProductIdentity } from './entities/product-identity.entity';
import { CreateProductIdentityDto } from './dto/create-product-identity.dto';
import { UpdateProductIdentityDto } from './dto/update-product-identity.dto';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductIdentityService {
  constructor(
    @Inject('PRODUCT_IDENTITY_REPOSITORY')
    private readonly productIdentityRepository: Repository<ProductIdentity>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crear una nueva identidad de producto
   */
  async create(
    createDto: CreateProductIdentityDto,
  ): Promise<ProductIdentity> {
    // Validar que la clave de identidad no exista
    const existing = await this.productIdentityRepository.findOne({
      where: { identityKey: createDto.identityKey },
    });

    if (existing) {
      throw new ConflictException(
        `La clave de identidad '${createDto.identityKey}' ya existe`,
      );
    }

    const newIdentity = this.productIdentityRepository.create(createDto);
    return await this.productIdentityRepository.save(newIdentity);
  }

  /**
   * Obtener todas las identidades de productos
   */
  async getAll(): Promise<ProductIdentity[]> {
    return await this.productIdentityRepository.find({
      relations: ['product', 'passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una identidad de producto por ID
   */
  async getById(id: string): Promise<ProductIdentity> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const identity = await this.productIdentityRepository.findOne({
      where: { id },
      relations: ['product', 'passportUsers'],
    });

    if (!identity) {
      throw new NotFoundException(
        `Identidad de producto con ID ${id} no encontrada`,
      );
    }

    return identity;
  }

  /**
   * Obtener una identidad de producto por clave única
   */
  async getByIdentityKey(identityKey: string): Promise<ProductIdentity> {
    if (!identityKey) {
      throw new BadRequestException('La clave de identidad es requerida');
    }

    const identity = await this.productIdentityRepository.findOne({
      where: { identityKey },
      relations: ['product', 'passportUsers'],
    });

    if (!identity) {
      throw new NotFoundException(
        `Identidad de producto con clave '${identityKey}' no encontrada`,
      );
    }

    return identity;
  }

  /**
   * Obtener identidades por ID de producto
   */
  async getByProductId(productId: string): Promise<ProductIdentity[]> {
    if (!productId) {
      throw new BadRequestException('El ID del producto es requerido');
    }

    return await this.productIdentityRepository.find({
      where: { productId },
      relations: ['product', 'passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener identidades por ID de tienda
   */
  async getByStoreId(storeId: string): Promise<ProductIdentity[]> {
    if (!storeId) {
      throw new BadRequestException('El ID de la tienda es requerido');
    }

    return await this.productIdentityRepository.find({
      where: { storeId },
      relations: ['product', 'passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener identidades por ID de artesano
   */
  async getByArtisanId(artisanId: string): Promise<ProductIdentity[]> {
    if (!artisanId) {
      throw new BadRequestException('El ID del artesano es requerido');
    }

    return await this.productIdentityRepository.find({
      where: { artisanId },
      relations: ['product', 'passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una identidad de producto
   */
  async update(
    id: string,
    updateDto: UpdateProductIdentityDto,
  ): Promise<ProductIdentity> {
    // Verificar que existe
    const identity = await this.getById(id);

    // Si se está actualizando la clave de identidad, validar que no exista
    if (updateDto.identityKey && updateDto.identityKey !== identity.identityKey) {
      const existing = await this.productIdentityRepository.findOne({
        where: { identityKey: updateDto.identityKey },
      });

      if (existing) {
        throw new ConflictException(
          `La clave de identidad '${updateDto.identityKey}' ya existe`,
        );
      }
    }

    // Actualizar
    await this.productIdentityRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar una identidad de producto (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.productIdentityRepository.softDelete(id);

    return {
      message: `Identidad de producto con ID ${id} eliminada exitosamente`,
    };
  }

  /**
   * Enviar invitación de certificado digital por email
   * Genera un registro de identidad de producto y envía el link de registro
   */
  async sendCertificateInvitation(
    productIdentityId: string,
    email: string,
  ): Promise<{ message: string; productIdentity: ProductIdentity }> {
    // Verificar que la identidad de producto existe
    const productIdentity = await this.getById(productIdentityId);

    // Obtener la URL del frontend
    const baseUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:1010'
    ).replace(/\/$/, '');

    // Construir el link con el identityKey
    const registrationLink = `${baseUrl}/certificate/register?key=${productIdentity.identityKey}`;

    // Enviar el email usando el servicio de mail
    await this.mailService.sendCustomEmail(
      email,
      '🎨 Certificado Digital de Autenticidad - Telar',
      'certificate-invitation',
      {
        registrationLink,
        identityKey: productIdentity.identityKey,
        supportEmail: this.configService.get<string>('MAIL_FROM_EMAIL'),
        logoUrl: this.configService.get<string>('LOGO_URL') || '/images/platform/telar-logo.png',
      },
    );

    return {
      message: `Invitación de certificado enviada exitosamente a ${email}`,
      productIdentity,
    };
  }

  /**
   * Crear identidad de producto con email
   * Busca automáticamente store_id y artisan_id desde product_core
   * Genera identityKey único y envía email de invitación
   */
  async createWithEmail(
    productId: string,
    email: string,
  ): Promise<{
    message: string;
    productIdentity: ProductIdentity;
    invitationSent: boolean;
  }> {
    // 1. Buscar información del producto en product_core
    const productCoreQuery = await this.dataSource.query(
      `
      SELECT 
        pc.id as product_id,
        pc.store_id,
        ap.id as artisan_id
      FROM shop.products_core pc
      INNER JOIN store.stores s ON pc.store_id = s.id
      INNER JOIN artesanos.artisan_profile ap ON s.user_id = ap.user_id
      WHERE pc.id = $1
      `,
      [productId],
    );

    if (!productCoreQuery || productCoreQuery.length === 0) {
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado`,
      );
    }

    const productData = productCoreQuery[0];

    if (!productData.store_id) {
      throw new BadRequestException(
        'El producto no tiene una tienda asociada',
      );
    }

    if (!productData.artisan_id) {
      throw new BadRequestException(
        'La tienda no tiene un artesano asociado',
      );
    }

    // 2. Generar identityKey único (formato: TELAR-{YEAR}-{UUID_SHORT})
    const year = new Date().getFullYear();
    const shortUuid = uuidv4().split('-')[0].toUpperCase();
    const identityKey = `TELAR-${year}-${shortUuid}`;

    // Verificar que no exista (muy improbable pero por seguridad)
    const existingKey = await this.productIdentityRepository.findOne({
      where: { identityKey },
    });

    if (existingKey) {
      // Si existe (extremadamente raro), generar uno nuevo recursivamente
      return this.createWithEmail(productId, email);
    }

    // 3. Crear el registro de product_identity
    const newIdentity = this.productIdentityRepository.create({
      identityKey,
      productId: productData.product_id,
      storeId: productData.store_id,
      artisanId: productData.artisan_id,
      isActive: true,
    });

    const savedIdentity = await this.productIdentityRepository.save(
      newIdentity,
    );

    // 4. Enviar email de invitación
    let invitationSent = false;
    try {
      await this.sendCertificateInvitation(savedIdentity.id, email);
      invitationSent = true;
    } catch (error) {
      console.error('Error al enviar email de invitación:', error);
      // No fallar la creación si el email falla
    }

    return {
      message: invitationSent
        ? `Identidad de producto creada y invitación enviada a ${email}`
        : `Identidad de producto creada, pero no se pudo enviar el email`,
      productIdentity: savedIdentity,
      invitationSent,
    };
  }
}
