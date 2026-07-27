import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UsersPassport } from './entities/users-passport.entity';
import { CreateUsersPassportDto } from './dto/create-users-passport.dto';
import { UpdateUsersPassportDto } from './dto/update-users-passport.dto';
import { MailService } from '../mail/mail.service';
import * as QRCode from 'qrcode';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class UsersPassportService {
  constructor(
    @Inject('USERS_PASSPORT_REPOSITORY')
    private readonly usersPassportRepository: Repository<UsersPassport>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  /**
   * Crear un nuevo usuario comprador
   */
  async create(createDto: CreateUsersPassportDto): Promise<UsersPassport> {
    const newUser = this.usersPassportRepository.create(createDto);
    return await this.usersPassportRepository.save(newUser);
  }

  /**
   * Obtener todos los usuarios compradores
   */
  async getAll(): Promise<UsersPassport[]> {
    return await this.usersPassportRepository.find({
      relations: ['passportUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un usuario comprador por ID
   */
  async getById(id: string): Promise<UsersPassport> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const user = await this.usersPassportRepository.findOne({
      where: { id },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario comprador con ID ${id} no encontrado`,
      );
    }

    return user;
  }

  /**
   * Obtener un usuario comprador por número de identificación
   */
  async getByNumIdentificacion(
    numIdentificacion: string,
  ): Promise<UsersPassport[]> {
    if (!numIdentificacion) {
      throw new BadRequestException(
        'El número de identificación es requerido',
      );
    }

    return await this.usersPassportRepository.find({
      where: { numIdentificacion },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un usuario comprador por email
   */
  async getByEmail(email: string): Promise<UsersPassport[]> {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    return await this.usersPassportRepository.find({
      where: { email },
      relations: ['passportUsers', 'passportUsers.productIdentity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un usuario comprador
   */
  async update(
    id: string,
    updateDto: UpdateUsersPassportDto,
  ): Promise<UsersPassport> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.usersPassportRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un usuario comprador (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.usersPassportRepository.softDelete(id);

    return {
      message: `Usuario comprador con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Registrar usuario comprador con identityKey
   * Busca la identidad del producto, crea el usuario y la relación en passport_user
   * Genera QR, crea PDF del certificado y lo envía por email
   */
  async registerWithIdentityKey(data: {
    identityKey: string;
    numIdentificacion: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
  }): Promise<{
    message: string;
    userPassport: UsersPassport;
    productIdentity: any;
  }> {
    // 1. Buscar el product_identity por identityKey
    const productIdentityQuery = await this.dataSource.query(
      `
      SELECT id, identity_key, product_id, store_id, artisan_id, is_active
      FROM digital_identity.product_identity
      WHERE identity_key = $1 AND is_active = true
      `,
      [data.identityKey],
    );

    if (!productIdentityQuery || productIdentityQuery.length === 0) {
      throw new NotFoundException(
        `No se encontró un certificado activo con la clave: ${data.identityKey}`,
      );
    }

    const productIdentity = productIdentityQuery[0];

    // 2. Buscar información del producto para el certificado
    const productInfoQuery = await this.dataSource.query(
      `
      SELECT 
        pc.name as product_name,
        pc.short_description as product_description,
        s.name as store_name,
        ap.full_name as artisan_name
      FROM shop.products_core pc
      INNER JOIN store.stores s ON pc.id = $1 AND s.id = $2
      INNER JOIN artesanos.artisan_profile ap ON ap.id = $3
      `,
      [productIdentity.product_id, productIdentity.store_id, productIdentity.artisan_id],
    );

    const productInfo = productInfoQuery && productInfoQuery.length > 0 
      ? productInfoQuery[0] 
      : { product_name: 'Producto Artesanal', store_name: 'Tienda', artisan_name: 'Artesano' };

    // 3. Crear el usuario comprador
    const newUserPassport = this.usersPassportRepository.create({
      numIdentificacion: data.numIdentificacion,
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      telefono: data.telefono,
    });

    const savedUserPassport =
      await this.usersPassportRepository.save(newUserPassport);

    // 4. Crear la relación en passport_user (tabla pivot)
    const passportUserResult = await this.dataSource.query(
      `
      INSERT INTO digital_identity.passport_user 
        (passport_identity_id, user_passport_id, is_active, created_at, updated_at)
      VALUES 
        ($1, $2, true, NOW(), NOW())
      RETURNING id
      `,
      [productIdentity.id, savedUserPassport.id],
    );

    const passportUserId = passportUserResult[0].id;

    // 5. Generar QR code con la información del certificado
    const qrData = JSON.stringify({
      certificateId: passportUserId,
      identityKey: data.identityKey,
      productId: productIdentity.product_id,
      owner: data.nombreCompleto,
      registeredAt: new Date().toISOString(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#142239',
        light: '#FFFFFF',
      },
    });

    // 6. Generar PDF del certificado
    const pdfBuffer = await this.generateCertificatePDF({
      buyerName: data.nombreCompleto,
      buyerEmail: data.email,
      buyerPhone: data.telefono,
      buyerId: data.numIdentificacion,
      productName: productInfo.product_name,
      productDescription: productInfo.product_description,
      storeName: productInfo.store_name,
      artisanName: productInfo.artisan_name,
      identityKey: data.identityKey,
      qrCodeDataUrl,
      registeredAt: new Date(),
    });

    // 7. Enviar email con el PDF del certificado
    try {
      await this.mailService.sendCertificateCompleted(
        data.email,
        data.nombreCompleto,
        productInfo.product_name,
        data.identityKey,
        pdfBuffer,
      );
    } catch (error) {
      console.error('Error al enviar email con certificado:', error);
      // No fallar el registro si el email falla
    }

    return {
      message:
        'Registro completado exitosamente. Certificado asociado a tu cuenta y enviado por email.',
      userPassport: savedUserPassport,
      productIdentity: {
        id: productIdentity.id,
        identityKey: productIdentity.identity_key,
        productId: productIdentity.product_id,
        storeId: productIdentity.store_id,
        artisanId: productIdentity.artisan_id,
      },
    };
  }

  /**
   * Generar PDF del certificado digital
   */
  private async generateCertificatePDF(data: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerId: string;
    productName: string;
    productDescription: string;
    storeName: string;
    artisanName: string;
    identityKey: string;
    qrCodeDataUrl: string;
    registeredAt: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Colores del tema TELAR
        const primaryColor = '#142239';
        const accentColor = '#f48c5f';

        // Header con logo (simulado con texto)
        doc
          .fontSize(32)
          .fillColor(primaryColor)
          .text('TELAR', 50, 50, { align: 'center' });

        doc
          .fontSize(10)
          .fillColor('#666')
          .text('Certificado Digital de Autenticidad', { align: 'center' });

        doc.moveDown(1);

        // Título principal
        doc
          .fontSize(24)
          .fillColor(accentColor)
          .text('Certificado de Autenticidad', { align: 'center' });

        doc.moveDown(0.5);

        // Línea decorativa
        doc
          .moveTo(150, doc.y)
          .lineTo(450, doc.y)
          .strokeColor(accentColor)
          .lineWidth(2)
          .stroke();

        doc.moveDown(2);

        // Información del producto
        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .text('PRODUCTO CERTIFICADO', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text(data.productName);

        if (data.productDescription) {
          doc
            .fontSize(11)
            .fillColor('#666')
            .font('Helvetica')
            .text(data.productDescription, {
              width: 500,
              align: 'left',
            });
        }

        doc.moveDown(1.5);

        // Información del artesano
        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('Creado por: ', { continued: true })
          .font('Helvetica')
          .text(data.artisanName);

        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('Tienda: ', { continued: true })
          .font('Helvetica')
          .text(data.storeName);

        doc.moveDown(1.5);

        // Información del propietario
        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('PROPIETARIO REGISTRADO', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('Nombre: ', { continued: true })
          .font('Helvetica')
          .text(data.buyerName);

        doc
          .fontSize(11)
          .fillColor('#666')
          .text(`ID: ${data.buyerId}`);

        doc.fontSize(11).text(`Email: ${data.buyerEmail}`);

        doc.fontSize(11).text(`Teléfono: ${data.buyerPhone}`);

        doc.moveDown(1.5);

        // Código de certificado
        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('CÓDIGO DE CERTIFICADO', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(16)
          .fillColor(accentColor)
          .font('Courier-Bold')
          .text(data.identityKey, { align: 'center' });

        doc.moveDown(1.5);

        // QR Code
        const qrImage = data.qrCodeDataUrl.split(',')[1];
        const qrBuffer = Buffer.from(qrImage, 'base64');

        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('CÓDIGO QR DE VERIFICACIÓN', { align: 'center' });

        doc.moveDown(0.5);

        const qrSize = 150;
        const pageWidth = doc.page.width;
        const qrX = (pageWidth - qrSize) / 2;

        doc.image(qrBuffer, qrX, doc.y, {
          width: qrSize,
          height: qrSize,
        });

        doc.moveDown(10);

        // Footer
        doc
          .fontSize(9)
          .fillColor('#999')
          .text(
            `Fecha de registro: ${data.registeredAt.toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`,
            { align: 'center' },
          );

        doc.moveDown(0.5);

        doc
          .fontSize(8)
          .fillColor('#999')
          .text(
            'Este certificado digital garantiza la autenticidad y procedencia del producto artesanal.',
            { align: 'center' },
          );

        doc.text('Emitido por TELAR - Conectando artesanos con el mundo 🇨🇴', {
          align: 'center',
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
